import { bots as listedBots } from './data.mjs';
import { makeMatcher } from './classify.mjs';

// Combined or common log format. Referrer and user agent are optional (common format has neither).
const LINE = /^(\S+) \S+ \S+ \[[^\]]+\] "(\S+) (\S+)[^"]*" (\d{3}) \S+(?: "([^"]*)" "([^"]*)")?/;

export function parseLogLine(line) {
  const m = LINE.exec(line);
  if (!m) return null;
  return { ip: m[1], method: m[2], path: m[3], status: Number(m[4]), referrer: m[5] || '', ua: m[6] || '' };
}

export function analyseLogs(text, options = {}) {
  const { extraReferrers = [] } = options;
  const matcher = makeMatcher(extraReferrers);
  const table = listedBots().map((b) => ({ ...b, re: new RegExp(b.token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }));
  const perBot = {};
  const roleTotals = {};
  const clicks = {};
  let lines = 0;
  let parsed = 0;
  let requests = 0;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.startsWith('#')) continue;
    lines++;
    const r = parseLogLine(raw);
    if (!r) continue;
    parsed++;
    requests++;
    // If a user agent names more than one token, the longest (most specific) one wins.
    const bot = table.filter((b) => b.re.test(r.ua)).sort((a, b) => b.token.length - a.token.length)[0];
    if (bot) {
      const e = (perBot[bot.token] ||= { token: bot.token, vendor: bot.vendor, role: bot.role, requests: 0, robotsTxt: 0, paths: {} });
      e.requests++;
      if (r.path === '/robots.txt') e.robotsTxt++;
      else e.paths[r.path] = (e.paths[r.path] || 0) + 1;
      roleTotals[bot.role] = (roleTotals[bot.role] || 0) + 1;
      continue;
    }
    const hit = matcher(r.referrer);
    if (hit) clicks[hit.vendor] = (clicks[hit.vendor] || 0) + 1;
  }
  return {
    lines,
    parsed,
    requests,
    bots: Object.values(perBot)
      .map((b) => ({ ...b, topPaths: Object.entries(b.paths).sort((x, y) => y[1] - x[1]).slice(0, 3) }))
      .map(({ paths, ...rest }) => rest)
      .sort((a, b) => b.requests - a.requests),
    roleTotals,
    clicks
  };
}

export function renderLogs(res) {
  const out = [];
  out.push(`Log lines: ${res.lines}, parsed: ${res.parsed}`);
  if (res.parsed < res.lines) out.push(`  ${res.lines - res.parsed} lines did not match the combined or common log format and were skipped.`);
  out.push('');
  if (res.bots.length) {
    out.push('Self-identified AI fetchers:');
    out.push('  ' + 'token'.padEnd(22) + 'role'.padEnd(14) + 'requests'.padStart(9) + '  robots.txt reads');
    for (const b of res.bots) out.push('  ' + b.token.padEnd(22) + b.role.padEnd(14) + String(b.requests).padStart(9) + '  ' + b.robotsTxt);
  } else {
    out.push('No documented AI fetcher user agents found.');
  }
  if (Object.keys(res.roleTotals).length) {
    out.push('', 'By role: ' + Object.entries(res.roleTotals).map(([k, v]) => `${k} ${v}`).join(', '));
  }
  out.push('', 'Human clicks that named an AI system as the referrer:');
  if (Object.keys(res.clicks).length) for (const [v, n] of Object.entries(res.clicks).sort((a, b) => b[1] - a[1])) out.push(`  ${v.padEnd(14)} ${n}`);
  else out.push('  none');
  out.push('', 'Read this carefully:');
  out.push('  A fetcher hit is a machine reading the page. It is not a visit and not a citation.');
  out.push('  user-fetch means a person asked an assistant about the page, so it is the closest log signal to live interest.');
  out.push('  Some assistants fetch as an ordinary browser and cannot be found here. User agents can be spoofed: verify by published IP ranges.');
  return out.join('\n');
}
