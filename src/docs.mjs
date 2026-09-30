import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './data.mjs';
import { renderMarkdown } from './matrix.mjs';
import { renderAdsMarkdown } from './ads.mjs';
import { sourceRegex, lookerFormula, bigquerySql, ga4Steps } from './templates.mjs';

export function ga4TemplateMarkdown() {
  return `# GA4 and Looker Studio template

Generated from the data files by \`npm run docs\`. The hosts come from \`data/referrers.json\`.

GA4 has a native AI Assistant channel since 2026-05-13. It covers only what Google recognises, no full list of recognised sources was found on the Analytics Help pages read on 2026-09-30, and it cannot see a visit that arrives without a referrer. This template does three jobs the native channel does not: it lists exactly which hosts it matches, it puts a labelled "suspicious direct" view beside the identified traffic, and it can be checked against the native channel row by row.

## 1. The host regex

Works as a full match, which is how GA4 channel group regex and Looker Studio REGEXP_MATCH both behave.

\`\`\`
${sourceRegex()}
\`\`\`

## 2. GA4 steps

\`\`\`
${ga4Steps()}
\`\`\`

## 3. Looker Studio calculated field

Create a calculated field on the GA4 data source, call it "AI traffic channel", and use it as the dimension in a table or chart. The order matters: the native channel is checked first, then the listed hosts, then the direct filter.

\`\`\`
${lookerFormula()}
\`\`\`

Not pasted into a live report by the author. Google's Data API schema, read on 2026-09-30, names two fields: "Landing page" (the path of the first pageview in a session) and "Landing page + query string". The formula uses the first because its regex matches a bare path. In the GA4 report UI, read on 2026-09-30, the default channel group lists an "AI Assistant" channel and the session dimension is labelled "Session primary channel group (Default channel group)". [[CONFIRM: the Looker Studio field names "Session default channel group", "Session source", "Session medium" and "Landing page" match your connector. The Explore dimension picker was not opened to check.]]

## 4. BigQuery

\`\`\`sql
${bigquerySql()}\`\`\`

## Check your work

1. Open Reports > Acquisition > Traffic acquisition for a past full month, add Session source / medium, and search for "chatgpt".
2. Note the sessions in the AI Assistant channel and the sessions in your listed-hosts channel. They should be close for ChatGPT, Gemini and Copilot. A host that shows up in one and not the other is the thing to investigate.
3. Do not add the three numbers (native, listed, suspicious direct) together. The first two overlap, and the third is not a count of AI visits.
`;
}

export function writeDocs(root = ROOT) {
  const dir = path.join(root, 'docs');
  fs.mkdirSync(dir, { recursive: true });
  const files = {
    'MATRIX.md': renderMarkdown(),
    'ADS.md': renderAdsMarkdown(),
    'GA4-TEMPLATE.md': ga4TemplateMarkdown()
  };
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text, 'utf8');
  return Object.keys(files).map((n) => path.join('docs', n));
}
