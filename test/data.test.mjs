import test from 'node:test';
import assert from 'node:assert/strict';
import { matrix, sources, bots, referrers, ads } from '../src/data.mjs';
import { validate } from '../src/validate.mjs';
import { renderGrid, renderMarkdown, staleCells, daysBetween, pickVendors, renderVendor } from '../src/matrix.mjs';
import { renderAds } from '../src/ads.mjs';

const clone = (x) => JSON.parse(JSON.stringify(x));

test('shipped data validates', () => {
  assert.deepEqual(validate(), []);
});

test('every vendor has every column, and there are at least ten vendors', () => {
  const m = matrix();
  assert.ok(m.vendors.length >= 10);
  for (const v of m.vendors) for (const c of m.columns) assert.ok(v.cells[c.id], `${v.id}.${c.id}`);
});

test('validation catches an unknown source', () => {
  const m = clone(matrix());
  m.vendors[0].cells.bots.sources = ['nope'];
  assert.ok(validate({ matrix: m }).some((p) => /unknown source "nope"/.test(p)));
});

test('validation catches a bad status and a bad date', () => {
  const m = clone(matrix());
  m.vendors[0].cells.bots.status = 'maybe';
  m.vendors[0].cells.controls.read = '30/09/2026';
  const p = validate({ matrix: m });
  assert.ok(p.some((x) => /status "maybe"/.test(x)));
  assert.ok(p.some((x) => /read date/.test(x)));
});

test('validation catches a cell with no source', () => {
  const m = clone(matrix());
  m.vendors[1].cells.owner_report.sources = [];
  assert.ok(validate({ matrix: m }).some((p) => /at least one source/.test(p)));
});

test('validation refuses yes that rests only on a secondary source', () => {
  const m = clone(matrix());
  m.vendors[0].cells.bots.status = 'yes';
  m.vendors[0].cells.bots.sources = ['surfacedby-probe'];
  assert.ok(validate({ matrix: m }).some((p) => /only on secondary/.test(p)));
});

test('validation refuses em dashes and curly quotes', () => {
  const m = clone(matrix());
  m.vendors[0].cells.bots.text = 'one — two, it’s';
  const p = validate({ matrix: m });
  assert.ok(p.some((x) => /dash/.test(x)));
  assert.ok(p.some((x) => /curly/.test(x)));
});

test('a listed bot must cite a vendor page', () => {
  const b = clone(bots());
  b[0].sources = ['surfacedby-probe'];
  assert.ok(validate({ bots: b }).some((p) => /vendor page/.test(p)));
});

test('every source URL is https and was read in the sprint window', () => {
  for (const [id, s] of Object.entries(sources())) {
    assert.match(s.url, /^https:\/\//, id);
    assert.match(s.read, /^2026-\d\d-\d\d$/, id);
  }
});

test('every CONFIRM sits in a cell that is not marked yes', () => {
  for (const v of matrix().vendors) {
    for (const [c, cell] of Object.entries(v.cells)) {
      if (cell.text.includes('[[CONFIRM')) assert.notEqual(cell.status, 'yes', `${v.id}.${c}`);
    }
  }
});

test('daysBetween counts whole days', () => {
  assert.equal(daysBetween('2026-09-30', '2026-10-30'), 30);
  assert.equal(daysBetween('2026-09-30', '2026-09-30'), 0);
});

test('staleCells is empty on the read date and full after a year', () => {
  assert.equal(staleCells(60, '2026-09-30').length, 0);
  const all = staleCells(60, '2027-09-30');
  assert.equal(all.length, matrix().vendors.length * matrix().columns.length);
  assert.ok(all[0].age >= 365);
});

test('staleCells respects the threshold', () => {
  assert.equal(staleCells(60, '2026-11-29').length, 0);
  assert.ok(staleCells(60, '2026-11-30').length > 0);
});

test('grid lists every vendor and a legend', () => {
  const g = renderGrid();
  for (const v of matrix().vendors) assert.ok(g.includes(v.name), v.name);
  assert.match(g, /none-found = not found on the read date/);
});

test('markdown cites every source used by a cell', () => {
  const md = renderMarkdown();
  const cited = new Set(matrix().vendors.flatMap((v) => Object.values(v.cells).flatMap((c) => c.sources)));
  for (const id of cited) assert.ok(md.includes(`[${id}] ${sources()[id].title}`), id);
});

test('pickVendors matches id or part of a name', () => {
  const m = matrix();
  assert.equal(pickVendors(m, ['google']).length, 1);
  assert.equal(pickVendors(m, ['Claude'])[0].id, 'anthropic');
  assert.equal(pickVendors(m, ['zzz']).length, 0);
  assert.equal(pickVendors(m, []).length, m.vendors.length);
});

test('vendor detail prints the source URL of each cell', () => {
  const v = matrix().vendors.find((x) => x.id === 'openai');
  assert.match(renderVendor(v), /platform\.openai\.com\/docs\/bots/);
});

test('referrers are unique hosts with sources', () => {
  const hosts = referrers().map((r) => r.host);
  assert.equal(new Set(hosts).size, hosts.length);
  for (const r of referrers()) assert.ok(r.sources.length);
});

test('ads data carries dated entries with sources, and states its primary-source gap', () => {
  const a = ads();
  assert.ok(a.timeline.length >= 4);
  assert.match(a.primary_source_gap, /CONFIRM/);
  const text = renderAds();
  for (const t of a.timeline) assert.ok(text.includes(t.date));
  assert.match(text, /Do not conclude/);
});
