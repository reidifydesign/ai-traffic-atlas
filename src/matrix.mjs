import { matrix, sources } from './data.mjs';

const DAY = 86400000;

export function daysBetween(fromIso, toIso) {
  return Math.round((Date.parse(toIso + 'T00:00:00Z') - Date.parse(fromIso + 'T00:00:00Z')) / DAY);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function pickVendors(m, ids) {
  if (!ids || !ids.length) return m.vendors;
  const want = ids.map((x) => x.toLowerCase());
  const found = m.vendors.filter((v) => want.includes(v.id) || want.some((w) => v.name.toLowerCase().includes(w)));
  return found;
}

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

/** Compact grid: one status word per cell and the oldest read date in the row. */
export function renderGrid(m = matrix()) {
  const nameW = Math.max(...m.vendors.map((v) => v.name.length)) + 2;
  const colW = 18;
  const head = pad('', nameW) + m.columns.map((c) => pad(c.label, colW)).join('') + 'Oldest read';
  const lines = [head, '-'.repeat(head.length)];
  for (const v of m.vendors) {
    const reads = m.columns.map((c) => v.cells[c.id].read).sort();
    lines.push(pad(v.name, nameW) + m.columns.map((c) => pad(v.cells[c.id].status, colW)).join('') + reads[0]);
  }
  const counts = {};
  for (const v of m.vendors) for (const c of m.columns) counts[v.cells[c.id].status] = (counts[v.cells[c.id].status] || 0) + 1;
  lines.push('');
  lines.push(
    Object.entries(counts)
      .sort()
      .map(([k, n]) => `${k}: ${n}`)
      .join('   ')
  );
  lines.push('yes = documented. partial = exists with a stated gap. none-found = not found on the read date (not proof).');
  lines.push('unverified = one secondary source or one test. Run "matrix --vendor <name>" for the detail and sources.');
  return lines.join('\n');
}

export function renderVendor(v, m = matrix(), src = sources()) {
  const out = [v.name, '='.repeat(v.name.length)];
  for (const c of m.columns) {
    const cell = v.cells[c.id];
    out.push('', `${c.label} [${cell.status}] read ${cell.read}`, cell.text);
    for (const id of cell.sources) out.push(`  source: ${src[id].url}`);
  }
  return out.join('\n');
}

export function renderMarkdown(m = matrix(), src = sources()) {
  const used = new Set();
  const out = [];
  out.push('# What each AI system shows a site owner');
  out.push('');
  out.push('Generated from `data/matrix.json` by `npm run docs`. Do not edit by hand.');
  out.push('');
  out.push(
    'Status key: **yes** documented by the vendor or clearly shown. **partial** exists with a stated gap. **none-found** nothing found in the pages read on the read date (absence is not proof). **unverified** one secondary source or one test.'
  );
  out.push('');
  out.push('| Vendor | ' + m.columns.map((c) => c.label).join(' | ') + ' |');
  out.push('|---|' + m.columns.map(() => '---|').join(''));
  for (const v of m.vendors) {
    out.push(`| ${v.name} | ` + m.columns.map((c) => v.cells[c.id].status).join(' | ') + ' |');
  }
  out.push('');
  out.push('Questions behind the columns:');
  out.push('');
  for (const c of m.columns) out.push(`- **${c.label}**: ${c.question}`);
  for (const v of m.vendors) {
    out.push('', `## ${v.name}`);
    for (const c of m.columns) {
      const cell = v.cells[c.id];
      cell.sources.forEach((s) => used.add(s));
      out.push('', `**${c.label}** (${cell.status}, read ${cell.read}). ${cell.text} Sources: ${cell.sources.map((s) => `[${s}]`).join(', ')}.`);
    }
  }
  out.push('', '## Sources', '');
  for (const id of [...used].sort()) {
    const s = src[id];
    out.push(`- [${id}] ${s.title}. ${s.kind}. ${s.published ? 'Published ' + s.published + '. ' : ''}Read ${s.read}. <${s.url}>`);
  }
  return out.join('\n') + '\n';
}

/** Cells whose read date is older than `days` as of `asOf`. */
export function staleCells(days, asOf = today(), m = matrix()) {
  const out = [];
  for (const v of m.vendors) {
    for (const c of m.columns) {
      const cell = v.cells[c.id];
      const age = daysBetween(cell.read, asOf);
      if (age > days) out.push({ vendor: v.name, column: c.label, status: cell.status, read: cell.read, age });
    }
  }
  return out.sort((a, b) => b.age - a.age);
}
