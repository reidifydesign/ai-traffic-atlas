import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceRegex, lookerFormula, bigquerySql, ga4Steps, renderTemplate } from '../src/templates.mjs';
import { referrers } from '../src/data.mjs';

test('regex full-matches every listed host and its subdomains', () => {
  const re = new RegExp(sourceRegex());
  for (const r of referrers()) {
    assert.ok(re.test(r.host), r.host);
    assert.ok(re.test('www.' + r.host), 'www.' + r.host);
  }
});

test('regex rejects lookalikes, direct and organic sources', () => {
  const re = new RegExp(sourceRegex());
  for (const s of ['notchatgpt.com', 'chatgpt.com.evil.example', 'chatgptXcom', 'google', '(direct)', 'bing', 'claude.ai.fake']) {
    assert.equal(re.test(s), false, s);
  }
});

test('extra referrers join the regex', () => {
  const re = new RegExp(sourceRegex(['you.com']));
  assert.ok(re.test('you.com'));
});

test('looker formula checks native first, then hosts, then direct, and doubles backslashes', () => {
  const f = lookerFormula();
  assert.ok(f.indexOf('ai-assistant') < f.indexOf('REGEXP_MATCH(Session source'));
  assert.ok(f.indexOf('REGEXP_MATCH(Session source') < f.indexOf('Suspicious direct'));
  assert.ok(f.includes('chatgpt\\\\.com'));
  assert.match(f, /ELSE Session default channel group\nEND$/);
});

test('bigquery sql embeds the hosts and flags itself as unrun', () => {
  const q = bigquerySql();
  assert.ok(q.includes('chatgpt\\.com'));
  assert.match(q, /\[\[CONFIRM/);
  assert.match(q, /PROJECT\.DATASET/);
});

test('ga4 steps include the regex and the two-group limit', () => {
  const s = ga4Steps();
  assert.ok(s.includes(sourceRegex()));
  assert.match(s, /two custom groups/);
});

test('renderTemplate rejects an unknown kind', () => {
  assert.throws(() => renderTemplate('nope'), /Unknown template/);
});
