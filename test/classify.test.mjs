import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { classifyCsv, makeMatcher, pathOf, hostOf, detectColumns } from '../src/classify.mjs';

const fixture = fs.readFileSync(new URL('../examples/ga4-export.csv', import.meta.url), 'utf8');

test('fixture totals match a hand count', () => {
  const r = classifyCsv(fixture);
  assert.equal(r.allSessions, 338);
  assert.equal(r.totals['ai-native'].sessions, 8);
  assert.equal(r.totals['ai-referrer'].sessions, 20);
  // Direct rows: the home page (48), /contact (7, 2 new) and /login (5, 1 new) stay out; three deep pages are in.
  assert.equal(r.totals['suspicious-direct'].sessions, 14 + 9 + 6);
  assert.equal(r.totals['direct-other'].sessions, 48 + 7 + 5);
  assert.equal(r.directSessions, 89);
});

test('identified vendors are grouped', () => {
  const r = classifyCsv(fixture);
  assert.deepEqual(r.byVendor, { OpenAI: 19, Anthropic: 3, Perplexity: 4, Google: 2 });
});

test('raising the new-user share removes the borderline rows', () => {
  const r = classifyCsv(fixture, { minNewShare: 0.95 });
  // 13 of 14 new is 0.93 and 8 of 9 is 0.89, so only the 6 of 6 row passes
  assert.equal(r.totals['suspicious-direct'].sessions, 6);
});

test('excluded paths are never suspicious', () => {
  const r = classifyCsv(fixture, { excludePaths: ['/services/aeo/'] });
  assert.equal(r.totals['suspicious-direct'].sessions, 14 + 6);
});

test('without a landing page column nothing is suspicious and a note says why', () => {
  const csv = 'Session source / medium,Sessions\n(direct) / (none),10\nchatgpt.com / referral,2\n';
  const r = classifyCsv(csv);
  assert.equal(r.totals['suspicious-direct'].sessions, 0);
  assert.equal(r.totals['direct-other'].sessions, 10);
  assert.equal(r.totals['ai-referrer'].sessions, 2);
  assert.ok(r.notes.some((n) => /landing page/i.test(n)));
});

test('separate source and medium columns work', () => {
  const csv = 'Session source,Session medium,Landing page,Sessions,New users\nclaude.ai,referral,/a,4,4\n(direct),(none),/deep,3,3\n';
  const r = classifyCsv(csv);
  assert.equal(r.totals['ai-referrer'].sessions, 4);
  assert.equal(r.totals['suspicious-direct'].sessions, 3);
});

test('native medium wins even for a source that is not on the list', () => {
  const csv = 'Session source / medium,Sessions\nsomenewbot.ai / ai-assistant,5\n';
  const r = classifyCsv(csv);
  assert.equal(r.totals['ai-native'].sessions, 5);
});

test('thousands separators in numbers are read', () => {
  const csv = 'Session source / medium,Sessions\n"chatgpt.com / referral","1,234"\n';
  assert.equal(classifyCsv(csv).totals['ai-referrer'].sessions, 1234);
});

test('missing Sessions column is a clear error', () => {
  assert.throws(() => classifyCsv('Session source / medium,Users\nx / y,3\n'), /Sessions/);
});

test('missing source columns is a clear error', () => {
  assert.throws(() => classifyCsv('Landing page,Sessions\n/,3\n'), /source/i);
});

test('host matching takes subdomains but not lookalikes', () => {
  const m = makeMatcher();
  assert.equal(m('chatgpt.com').vendor, 'OpenAI');
  assert.equal(m('www.chatgpt.com').vendor, 'OpenAI');
  assert.equal(m('https://chat.deepseek.com/x').vendor, 'DeepSeek');
  assert.equal(m('notchatgpt.com'), null);
  assert.equal(m('chatgpt.com.evil.example'), null);
  assert.equal(m('google.com'), null);
  assert.equal(m('(direct)'), null);
  assert.equal(m(''), null);
});

test('extra referrers are added and tagged custom', () => {
  const m = makeMatcher(['You.com', 'https://phind.com/search']);
  assert.equal(m('you.com').vendor, 'custom');
  assert.equal(m('phind.com').vendor, 'custom');
});

test('pathOf and hostOf normalise', () => {
  assert.equal(pathOf('/a/b/?x=1#h'), '/a/b');
  assert.equal(pathOf('https://ex.com/a?x=1'), '/a');
  assert.equal(pathOf('(not set)'), null);
  assert.equal(pathOf('/'), '/');
  assert.equal(hostOf('HTTPS://WWW.Example.com/path?q=1'), 'example.com');
});

test('detectColumns finds GA4 names and ignores engaged sessions', () => {
  const c = detectColumns(['Session source / medium', 'Landing page + query string', 'Engaged sessions', 'Sessions', 'New users']);
  assert.equal(c.sourceMedium, 'Session source / medium');
  assert.equal(c.landing, 'Landing page + query string');
  assert.equal(c.sessions, 'Sessions');
  assert.equal(c.newUsers, 'New users');
});
