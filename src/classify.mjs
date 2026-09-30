import { parseCsvObjects } from './csv.mjs';
import { referrers as listedReferrers } from './data.mjs';

export const CATEGORIES = ['ai-native', 'ai-referrer', 'suspicious-direct', 'direct-other', 'other'];

const num = (s) => {
  const n = Number(String(s ?? '').replace(/[, ]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/** Find which CSV columns hold what. Works on GA4 UI exports and Looker Studio exports. */
export function detectColumns(headers) {
  const norm = headers.map((h) => h.toLowerCase().replace(/\s+/g, ' ').trim());
  const find = (pred) => {
    const i = norm.findIndex(pred);
    return i === -1 ? null : headers[i];
  };
  const cols = {
    sourceMedium: find((h) => /source ?\/ ?medium/.test(h)),
    source: find((h) => /source/.test(h) && !/medium/.test(h)),
    medium: find((h) => /medium/.test(h) && !/source/.test(h)),
    landing: find((h) => /landing page/.test(h)),
    sessions: find((h) => h === 'sessions') || find((h) => /sessions/.test(h) && !/engaged|per|rate/.test(h)),
    newUsers: find((h) => h === 'new users')
  };
  return cols;
}

export function hostOf(value) {
  let v = String(value || '').trim().toLowerCase();
  if (!v) return '';
  v = v.replace(/^[a-z]+:\/\//, '');
  v = v.split(/[/?#\s]/)[0];
  return v.replace(/^www\./, '');
}

export function makeMatcher(extra = []) {
  const entries = [
    ...listedReferrers().map((r) => ({ host: r.host, vendor: r.vendor })),
    ...extra.map((h) => ({ host: hostOf(h), vendor: 'custom' })).filter((e) => e.host)
  ];
  return (value) => {
    const h = hostOf(value);
    if (!h) return null;
    return entries.find((e) => h === e.host || h.endsWith('.' + e.host)) || null;
  };
}

export function pathOf(value) {
  let v = String(value || '').trim();
  if (!v || v === '(not set)') return null;
  v = v.replace(/^[a-z]+:\/\/[^/]+/i, '');
  v = v.split(/[?#]/)[0];
  if (!v.startsWith('/')) v = '/' + v;
  return v.length > 1 ? v.replace(/\/+$/, '') : v;
}

const HOME = new Set(['/', '/index.html', '/index.php', '/index']);

/**
 * Classify GA4 rows.
 * options: extraReferrers[], minNewShare (0..1), excludePaths[] (pages people type or bookmark)
 */
export function classifyCsv(text, options = {}) {
  const { extraReferrers = [], minNewShare = 0.8, excludePaths = [] } = options;
  const { headers, records } = parseCsvObjects(text);
  const cols = detectColumns(headers);
  const notes = [];
  if (!cols.sessions) throw new Error('No Sessions column found. Export a table that includes Sessions.');
  if (!cols.sourceMedium && !(cols.source && cols.medium)) {
    throw new Error('Need either "Session source / medium" or separate Session source and Session medium columns.');
  }
  if (!cols.landing) notes.push('No landing page column: direct rows cannot be split, so none are marked suspicious.');
  if (!cols.newUsers) notes.push('No New users column: the new-user test was skipped, so the suspicious-direct filter is looser.');

  const match = makeMatcher(extraReferrers);
  const excluded = new Set(excludePaths.map((p) => pathOf(p)).filter(Boolean));
  const totals = Object.fromEntries(CATEGORIES.map((c) => [c, { rows: 0, sessions: 0 }]));
  const byVendor = {};
  const suspiciousPages = {};
  let allSessions = 0;

  for (const r of records) {
    const sessions = num(r[cols.sessions]);
    if (!sessions) continue;
    let source;
    let medium;
    if (cols.sourceMedium) {
      const parts = r[cols.sourceMedium].split(' / ');
      source = (parts[0] || '').trim();
      medium = parts.slice(1).join(' / ').trim();
    } else {
      source = r[cols.source];
      medium = r[cols.medium];
    }
    let cat = 'other';
    const hit = match(source);
    if (medium.toLowerCase() === 'ai-assistant') {
      cat = 'ai-native';
      const v = (hit && hit.vendor) || source || 'unknown';
      byVendor[v] = (byVendor[v] || 0) + sessions;
    } else if (hit) {
      cat = 'ai-referrer';
      byVendor[hit.vendor] = (byVendor[hit.vendor] || 0) + sessions;
    } else if (source.toLowerCase() === '(direct)' && ['(none)', '(not set)', ''].includes(medium.toLowerCase())) {
      cat = 'direct-other';
      if (cols.landing) {
        const p = pathOf(r[cols.landing]);
        const isHomeOrExcluded = !p || HOME.has(p) || excluded.has(p);
        const newShare = cols.newUsers ? num(r[cols.newUsers]) / sessions : 1;
        if (!isHomeOrExcluded && newShare >= minNewShare) {
          cat = 'suspicious-direct';
          suspiciousPages[p] = (suspiciousPages[p] || 0) + sessions;
        }
      }
    }
    totals[cat].rows += 1;
    totals[cat].sessions += sessions;
    allSessions += sessions;
  }

  const directSessions = totals['suspicious-direct'].sessions + totals['direct-other'].sessions;
  return {
    columns: cols,
    allSessions,
    totals,
    byVendor,
    suspiciousPages: Object.entries(suspiciousPages)
      .sort((a, b) => b[1] - a[1])
      .map(([page, sessions]) => ({ page, sessions })),
    directSessions,
    suspiciousShareOfDirect: directSessions ? totals['suspicious-direct'].sessions / directSessions : null,
    settings: { minNewShare, excludePaths: [...excluded] },
    notes
  };
}

const pct = (n, d) => (d ? ((100 * n) / d).toFixed(1) + '%' : 'n/a');

export function renderClassification(res) {
  const out = [];
  out.push(`Sessions read: ${res.allSessions}`);
  out.push('');
  const w = 20;
  out.push('category'.padEnd(w) + 'rows'.padStart(6) + 'sessions'.padStart(10) + 'share'.padStart(9));
  for (const c of CATEGORIES) {
    const t = res.totals[c];
    out.push(c.padEnd(w) + String(t.rows).padStart(6) + String(t.sessions).padStart(10) + pct(t.sessions, res.allSessions).padStart(9));
  }
  if (Object.keys(res.byVendor).length) {
    out.push('', 'Identified AI sessions by vendor (native channel and listed referrers):');
    for (const [v, n] of Object.entries(res.byVendor).sort((a, b) => b[1] - a[1])) out.push(`  ${v.padEnd(14)} ${n}`);
  }
  if (res.suspiciousPages.length) {
    out.push('', 'Landing pages behind the suspicious-direct sessions:');
    for (const p of res.suspiciousPages.slice(0, 10)) out.push(`  ${String(p.sessions).padStart(6)}  ${p.page}`);
  }
  if (res.directSessions) {
    out.push('', `Suspicious direct is ${pct(res.totals['suspicious-direct'].sessions, res.directSessions)} of ${res.directSessions} direct sessions.`);
  }
  out.push('', 'Read this carefully:');
  out.push('  ai-native and ai-referrer are visits the referrer identified. They are a floor, not the total.');
  out.push('  suspicious-direct is a filter (direct, not the home page, mostly new users). It is NOT an estimate of AI visits.');
  out.push('  Bookmarks, email links, app links and dark social pass the same filter. There is no error bar, because there is no ground truth.');
  out.push(`  Settings: new-user share >= ${res.settings.minNewShare}; excluded pages: ${res.settings.excludePaths.join(', ') || 'none'}.`);
  for (const n of res.notes) out.push('  Note: ' + n);
  return out.join('\n');
}
