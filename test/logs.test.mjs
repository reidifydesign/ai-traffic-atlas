import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseLogLine, analyseLogs } from '../src/logs.mjs';

const fixture = fs.readFileSync(new URL('../examples/access.log', import.meta.url), 'utf8');

test('parses a combined log line', () => {
  const r = parseLogLine('1.2.3.4 - - [30/Sep/2026:10:00:01 +0000] "GET /a?x=1 HTTP/1.1" 200 12 "https://chatgpt.com/" "UA/1.0"');
  assert.deepEqual(r, { ip: '1.2.3.4', method: 'GET', path: '/a?x=1', status: 200, referrer: 'https://chatgpt.com/', ua: 'UA/1.0' });
});

test('parses a common log line with no referrer or user agent', () => {
  const r = parseLogLine('1.2.3.4 - - [30/Sep/2026:10:00:01 +0000] "GET /a HTTP/1.1" 404 0');
  assert.equal(r.status, 404);
  assert.equal(r.ua, '');
});

test('returns null for junk', () => {
  assert.equal(parseLogLine('not a log line'), null);
});

test('fixture counts match a hand count', () => {
  const r = analyseLogs(fixture);
  assert.equal(r.lines, 15);
  assert.equal(r.parsed, 15);
  const by = Object.fromEntries(r.bots.map((b) => [b.token, b]));
  assert.equal(by['GPTBot'].requests, 2);
  assert.equal(by['GPTBot'].robotsTxt, 1);
  assert.equal(by['ChatGPT-User'].requests, 2);
  assert.equal(by['Claude-User'].robotsTxt, 1);
  assert.equal(by['OAI-SearchBot'].role, 'search-index');
  assert.deepEqual(r.roleTotals, { training: 3, 'user-fetch': 4, 'search-index': 2, mixed: 1 });
  assert.deepEqual(r.clicks, { OpenAI: 2, Google: 1 });
});

test('google.com referrals are not counted as AI clicks', () => {
  const r = analyseLogs('1.1.1.1 - - [30/Sep/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 1 "https://www.google.com/" "Mozilla/5.0"\n');
  assert.deepEqual(r.clicks, {});
});

test('a request from a bot is not also counted as a click', () => {
  const r = analyseLogs('1.1.1.1 - - [30/Sep/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 1 "https://chatgpt.com/" "ChatGPT-User/1.0"\n');
  assert.deepEqual(r.clicks, {});
  assert.equal(r.bots[0].token, 'ChatGPT-User');
});

test('the most specific token wins', () => {
  const r = analyseLogs('1.1.1.1 - - [30/Sep/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 1 "-" "x Claude-SearchBot/1.0 ClaudeBot"\n');
  assert.equal(r.bots.length, 1);
  assert.equal(r.bots[0].token, 'Claude-SearchBot');
});

test('comment and blank lines are ignored', () => {
  const r = analyseLogs('# note\n\n');
  assert.equal(r.lines, 0);
});

test('extra referrers count as clicks', () => {
  const r = analyseLogs('1.1.1.1 - - [30/Sep/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 1 "https://you.com/" "Mozilla/5.0"\n', { extraReferrers: ['you.com'] });
  assert.deepEqual(r.clicks, { custom: 1 });
});
