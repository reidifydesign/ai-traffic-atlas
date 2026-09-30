import { matrix, sources, referrers, bots, ads, STATUSES } from './data.mjs';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const ROLES = ['training', 'search-index', 'user-fetch', 'answer-fetch', 'ads-check', 'mixed'];

function walkStrings(value, fn, where = '') {
  if (typeof value === 'string') fn(value, where);
  else if (Array.isArray(value)) value.forEach((v, i) => walkStrings(v, fn, `${where}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walkStrings(v, fn, where ? `${where}.${k}` : k);
}

/** Returns a list of problems. An empty list means the data files are internally consistent. */
export function validate(data = {}) {
  const m = data.matrix || matrix();
  const src = data.sources || sources();
  const refs = data.referrers || referrers();
  const botList = data.bots || bots();
  const adsData = data.ads || ads();
  const problems = [];
  const bad = (msg) => problems.push(msg);

  for (const [id, s] of Object.entries(src)) {
    if (!/^https:\/\//.test(s.url || '')) bad(`source ${id}: url must start with https://`);
    if (!ISO.test(s.read || '')) bad(`source ${id}: read date must be YYYY-MM-DD`);
    if (s.published != null && !ISO.test(s.published)) bad(`source ${id}: published must be YYYY-MM-DD or null`);
    if (!['vendor', 'secondary'].includes(s.kind)) bad(`source ${id}: kind must be vendor or secondary`);
    if (!s.title) bad(`source ${id}: missing title`);
  }

  const colIds = m.columns.map((c) => c.id);
  for (const v of m.vendors) {
    for (const c of colIds) {
      const cell = v.cells[c];
      const where = `${v.id}.${c}`;
      if (!cell) {
        bad(`${where}: missing cell`);
        continue;
      }
      if (!STATUSES.includes(cell.status)) bad(`${where}: status "${cell.status}" is not one of ${STATUSES.join(', ')}`);
      if (!ISO.test(cell.read || '')) bad(`${where}: read date must be YYYY-MM-DD`);
      if (!cell.text || !cell.text.trim()) bad(`${where}: empty text`);
      if (!Array.isArray(cell.sources) || !cell.sources.length) bad(`${where}: a cell needs at least one source`);
      for (const s of cell.sources || []) if (!src[s]) bad(`${where}: unknown source "${s}"`);
      // A claim that rests only on a third party must not be marked "yes".
      if (cell.status === 'yes' && (cell.sources || []).length && (cell.sources || []).every((s) => src[s] && src[s].kind === 'secondary')) {
        bad(`${where}: status yes rests only on secondary sources`);
      }
    }
    for (const c of Object.keys(v.cells)) if (!colIds.includes(c)) bad(`${v.id}: unknown column "${c}"`);
  }

  for (const r of refs) for (const s of r.sources || []) if (!src[s]) bad(`referrer ${r.host}: unknown source "${s}"`);
  if (!refs.length) bad('no referrers listed');
  for (const b of botList) {
    if (!ROLES.includes(b.role)) bad(`bot ${b.token}: role "${b.role}" is not one of ${ROLES.join(', ')}`);
    if (!(b.sources || []).length) bad(`bot ${b.token}: needs a source`);
    for (const s of b.sources || []) {
      if (!src[s]) bad(`bot ${b.token}: unknown source "${s}"`);
      else if (src[s].kind !== 'vendor') bad(`bot ${b.token}: a listed token must come from a vendor page`);
    }
  }

  if (!ISO.test(adsData.as_of || '')) bad('ads: as_of must be YYYY-MM-DD');
  for (const t of adsData.timeline || []) {
    if (!ISO.test(t.date || '')) bad(`ads timeline "${(t.fact || '').slice(0, 30)}": date must be YYYY-MM-DD`);
    for (const s of t.sources || []) if (!src[s]) bad(`ads timeline ${t.date}: unknown source "${s}"`);
    if (!(t.sources || []).length) bad(`ads timeline ${t.date}: needs a source`);
  }
  for (const e of adsData.reporting_effects || []) {
    if (!(e.sources || []).length) bad(`ads effect ${e.id}: needs a source`);
    for (const s of e.sources || []) if (!src[s]) bad(`ads effect ${e.id}: unknown source "${s}"`);
  }

  // House style: no em dashes, no curly apostrophes anywhere in the shipped data.
  const all = { matrix: m, sources: src, referrers: refs, bots: botList, ads: adsData };
  walkStrings(all, (str, where) => {
    if (/—|–/.test(str)) bad(`${where}: contains a dash character that is not a hyphen`);
    if (/[‘’“”]/.test(str)) bad(`${where}: contains a curly quote`);
  });
  return problems;
}
