#!/usr/bin/env node
import fs from 'node:fs';
import { matrix, sources, bots } from '../src/data.mjs';
import { renderGrid, renderVendor, renderMarkdown, pickVendors, staleCells, today } from '../src/matrix.mjs';
import { validate } from '../src/validate.mjs';
import { renderAds, renderAdsMarkdown } from '../src/ads.mjs';
import { renderTemplate } from '../src/templates.mjs';
import { classifyCsv, renderClassification } from '../src/classify.mjs';
import { analyseLogs, renderLogs } from '../src/logs.mjs';
import { writeDocs } from '../src/docs.mjs';

const HELP = `ai-traffic-atlas: what each AI system shows a site owner, and what to do with the traffic you can see.

Usage: ai-traffic-atlas <command> [options]

Reference (dated, sourced)
  matrix [--vendor <name>]... [--format table|md|json]   The vendor matrix. Default: a one-screen grid.
  stale [--days 60] [--today YYYY-MM-DD]                 Cells whose read date is older than N days. Exit 1 if any.
  sources                                                Every source with kind, dates and URL.
  bots [--role training|search-index|user-fetch|...]     Documented AI fetcher tokens and what each does.
  ads [--format text|md]                                 Dated notes on ads in AI answers and what they change for reporting.
  validate                                               Check the data files are consistent. Exit 1 on problems.

Your own data
  template regex|looker|ga4|bigquery [--extra-referrers a.com,b.com]
                                                         GA4 and Looker Studio classification templates.
  classify <ga4-export.csv> [--extra-referrers a,b] [--min-new-share 0.8] [--exclude-paths /login,/contact] [--json]
                                                         Split a GA4 export into native, listed, suspicious direct and other.
  logs <access.log> [--extra-referrers a,b] [--json]     Count AI fetchers and AI-referred clicks in a combined-format log.

Maintainers
  docs                                                   Regenerate docs/MATRIX.md, docs/ADS.md and docs/GA4-TEMPLATE.md.

Nothing here sends your data anywhere. All commands read local files.
`;

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const isBool = ['json'].includes(key);
      const val = isBool ? true : argv[++i];
      if (val === undefined) throw new Error(`--${key} needs a value`);
      (flags[key] ||= []).push(val);
    } else positional.push(a);
  }
  return { positional, flags };
}

const one = (flags, k, dflt) => (flags[k] ? flags[k][flags[k].length - 1] : dflt);
const list = (flags, k) => (flags[k] || []).flatMap((v) => String(v).split(',')).map((s) => s.trim()).filter(Boolean);

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(HELP);
    return 0;
  }
  const { positional, flags } = parseArgs(argv);
  const cmd = positional[0] || 'matrix';
  switch (cmd) {
    case 'help':
    case '--help':
    case '-h':
      console.log(HELP);
      return 0;
    case 'matrix': {
      const m = matrix();
      const fmt = one(flags, 'format', 'table');
      const vendors = list(flags, 'vendor');
      const picked = pickVendors(m, vendors);
      if (vendors.length && !picked.length) {
        console.error(`No vendor matches ${vendors.join(', ')}. Known: ${m.vendors.map((v) => v.id).join(', ')}`);
        return 2;
      }
      if (fmt === 'json') console.log(JSON.stringify({ ...m, vendors: picked }, null, 2));
      else if (fmt === 'md') process.stdout.write(renderMarkdown({ ...m, vendors: picked }));
      else if (vendors.length) console.log(picked.map((v) => renderVendor(v, m)).join('\n\n'));
      else console.log(renderGrid(m));
      return 0;
    }
    case 'stale': {
      const days = Number(one(flags, 'days', 60));
      const asOf = one(flags, 'today', today());
      const rows = staleCells(days, asOf);
      if (!rows.length) {
        console.log(`OK  no cell older than ${days} days as of ${asOf}`);
        return 0;
      }
      console.log(`WARN  ${rows.length} cells older than ${days} days as of ${asOf}:`);
      for (const r of rows) console.log(`  ${String(r.age).padStart(4)} days  ${r.vendor} / ${r.column}  (read ${r.read}, ${r.status})`);
      return 1;
    }
    case 'sources': {
      for (const [id, s] of Object.entries(sources())) console.log(`${id}\n  ${s.kind}${s.published ? ', published ' + s.published : ''}, read ${s.read}\n  ${s.title}\n  ${s.url}`);
      return 0;
    }
    case 'bots': {
      const role = one(flags, 'role');
      const rows = bots().filter((b) => !role || b.role === role);
      for (const b of rows) console.log(`${b.token.padEnd(24)} ${b.vendor.padEnd(12)} ${b.role}`);
      if (!rows.length) {
        console.error('No bots with that role.');
        return 2;
      }
      return 0;
    }
    case 'ads':
      if (one(flags, 'format', 'text') === 'md') process.stdout.write(renderAdsMarkdown());
      else console.log(renderAds());
      return 0;
    case 'validate': {
      const problems = validate();
      if (problems.length) {
        console.log(`FAIL  ${problems.length} problems`);
        for (const p of problems) console.log('  ' + p);
        return 1;
      }
      const m = matrix();
      const cells = m.vendors.length * m.columns.length;
      console.log(`OK  ${m.vendors.length} vendors, ${cells} cells, ${Object.keys(sources()).length} sources: every cell has a status, a read date and a source`);
      return 0;
    }
    case 'template': {
      const kind = positional[1];
      if (!kind) {
        console.error('Usage: template regex|looker|ga4|bigquery');
        return 2;
      }
      console.log(renderTemplate(kind, list(flags, 'extra-referrers')));
      return 0;
    }
    case 'classify': {
      const file = positional[1];
      if (!file) {
        console.error('Usage: classify <ga4-export.csv>');
        return 2;
      }
      const res = classifyCsv(fs.readFileSync(file, 'utf8'), {
        extraReferrers: list(flags, 'extra-referrers'),
        minNewShare: Number(one(flags, 'min-new-share', 0.8)),
        excludePaths: list(flags, 'exclude-paths')
      });
      console.log(flags.json ? JSON.stringify(res, null, 2) : renderClassification(res));
      return 0;
    }
    case 'logs': {
      const file = positional[1];
      if (!file) {
        console.error('Usage: logs <access.log>');
        return 2;
      }
      const res = analyseLogs(fs.readFileSync(file, 'utf8'), { extraReferrers: list(flags, 'extra-referrers') });
      console.log(flags.json ? JSON.stringify(res, null, 2) : renderLogs(res));
      return 0;
    }
    case 'docs':
      for (const f of writeDocs()) console.log('wrote ' + f);
      return 0;
    default:
      console.error(`Unknown command "${cmd}". Run with --help.`);
      return 2;
  }
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (err) {
  console.error('Error: ' + err.message);
  process.exitCode = 2;
}
