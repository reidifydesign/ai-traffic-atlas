import { ads, sources } from './data.mjs';

export function renderAds(a = ads(), src = sources()) {
  const used = new Set();
  const cite = (ids) => ids.map((s) => (used.add(s), `[${s}]`)).join(' ');
  const out = [a.title, '='.repeat(a.title.length), `As of ${a.as_of}. Ad products change monthly.`, '', a.scope, '', a.primary_source_gap, '', 'Timeline'];
  for (const t of a.timeline) out.push(`  ${t.date}  ${t.fact} ${cite(t.sources)}`);
  out.push('', 'What this changes for reporting');
  for (const e of a.reporting_effects) {
    out.push(`  ${e.id} (${e.basis})`, `    ${e.claim}`);
    if (e.note) out.push(`    ${e.note}`);
    out.push(`    Do: ${e.action} ${cite(e.sources)}`);
  }
  out.push('', 'Do not conclude');
  for (const w of a.what_not_to_conclude) out.push(`  - ${w}`);
  out.push('', 'Sources');
  for (const id of [...used].sort()) out.push(`  [${id}] ${src[id].url} (read ${src[id].read})`);
  return out.join('\n');
}

export function renderAdsMarkdown(a = ads(), src = sources()) {
  const used = new Set();
  const cite = (ids) => ids.map((s) => (used.add(s), `[${s}]`)).join(' ');
  const out = [`# ${a.title}`, '', `As of ${a.as_of}. Generated from \`data/ads.json\` by \`npm run docs\`.`, '', a.scope, '', a.primary_source_gap, '', '## Timeline', ''];
  for (const t of a.timeline) out.push(`- **${t.date}** ${t.fact} ${cite(t.sources)}`);
  out.push('', '## What this changes for reporting', '');
  for (const e of a.reporting_effects) {
    out.push(`### ${e.id}`, '', `Basis: ${e.basis}. ${e.claim}`, '');
    if (e.note) out.push(e.note, '');
    out.push(`What to do: ${e.action} ${cite(e.sources)}`, '');
  }
  out.push('## Do not conclude', '');
  for (const w of a.what_not_to_conclude) out.push(`- ${w}`);
  out.push('', '## Sources', '');
  for (const id of [...used].sort()) out.push(`- [${id}] ${src[id].title}. Read ${src[id].read}. <${src[id].url}>`);
  return out.join('\n') + '\n';
}
