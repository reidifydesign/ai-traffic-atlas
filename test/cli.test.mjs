import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderMarkdown } from '../src/matrix.mjs';
import { renderAdsMarkdown } from '../src/ads.mjs';
import { ga4TemplateMarkdown } from '../src/docs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = (...args) => spawnSync(process.execPath, [path.join(ROOT, 'bin', 'ai-traffic-atlas.mjs'), ...args], { encoding: 'utf8' });
const GA4 = path.join(ROOT, 'examples', 'ga4-export.csv');
const LOG = path.join(ROOT, 'examples', 'access.log');

test('no arguments prints the grid', () => {
  const r = run();
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Owner report/);
});

test('validate passes on the shipped data', () => {
  const r = run('validate');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /^OK /);
});

test('stale exits 0 on the read date and 1 far in the future', () => {
  assert.equal(run('stale', '--today', '2026-09-30').status, 0);
  const late = run('stale', '--today', '2027-06-01');
  assert.equal(late.status, 1);
  assert.match(late.stdout, /cells older than 60 days/);
});

test('matrix --vendor prints detail and --format json is valid JSON', () => {
  const r = run('matrix', '--vendor', 'perplexity');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Perplexity-User/);
  const j = JSON.parse(run('matrix', '--vendor', 'openai', '--format', 'json').stdout);
  assert.equal(j.vendors.length, 1);
});

test('unknown vendor exits 2', () => {
  assert.equal(run('matrix', '--vendor', 'zzz').status, 2);
});

test('unknown command exits 2', () => {
  assert.equal(run('frobnicate').status, 2);
});

test('--help works', () => {
  const r = run('--help');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Usage:/);
});

test('classify and logs run on the examples, and --json is valid', () => {
  const c = run('classify', GA4);
  assert.equal(c.status, 0);
  assert.match(c.stdout, /NOT an estimate of AI visits/);
  assert.equal(JSON.parse(run('classify', GA4, '--json').stdout).allSessions, 338);
  const l = run('logs', LOG);
  assert.equal(l.status, 0);
  assert.match(l.stdout, /ChatGPT-User/);
});

test('classify flags change the answer', () => {
  const r = run('classify', GA4, '--exclude-paths', '/services/aeo', '--json');
  assert.equal(JSON.parse(r.stdout).totals['suspicious-direct'].sessions, 20);
});

test('classify on a missing file fails with a message, not a stack', () => {
  const r = run('classify', 'nope.csv');
  assert.equal(r.status, 2);
  assert.match(r.stderr, /^Error: /);
});

test('template prints the regex with extra hosts', () => {
  const r = run('template', 'regex', '--extra-referrers', 'you.com');
  assert.equal(r.status, 0);
  assert.ok(r.stdout.includes('you\\.com'));
});

test('bots can be filtered by role', () => {
  const r = run('bots', '--role', 'user-fetch');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /ChatGPT-User/);
  assert.doesNotMatch(r.stdout, /GPTBot /);
});

test('committed docs are in sync with the data files', () => {
  assert.equal(fs.readFileSync(path.join(ROOT, 'docs', 'MATRIX.md'), 'utf8'), renderMarkdown(), 'run npm run docs');
  assert.equal(fs.readFileSync(path.join(ROOT, 'docs', 'ADS.md'), 'utf8'), renderAdsMarkdown(), 'run npm run docs');
  assert.equal(fs.readFileSync(path.join(ROOT, 'docs', 'GA4-TEMPLATE.md'), 'utf8'), ga4TemplateMarkdown(), 'run npm run docs');
});
