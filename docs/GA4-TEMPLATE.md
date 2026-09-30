# GA4 and Looker Studio template

Generated from the data files by `npm run docs`. The hosts come from `data/referrers.json`.

GA4 has a native AI Assistant channel since 2026-05-13. It covers only what Google recognises, the full list was not published when this was read on 2026-09-30, and it cannot see a visit that arrives without a referrer. This template does three jobs the native channel does not: it lists exactly which hosts it matches, it puts a labelled "suspicious direct" view beside the identified traffic, and it can be checked against the native channel row by row.

## 1. The host regex

Works as a full match, which is how GA4 channel group regex and Looker Studio REGEXP_MATCH both behave.

```
^(.*\.)?(chatgpt\.com|claude\.ai|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|deepseek\.com|grok\.com|meta\.ai)$
```

## 2. GA4 steps

```
GA4 custom channel group for AI referrers
1. Admin > Data settings > Channel groups > Create new channel group. A standard property can hold two custom groups, so check a slot is free.
2. Name it "AI referrers (listed)". Add a channel called "AI referrer".
3. Condition: Source  matches regex  ^(.*\.)?(chatgpt\.com|claude\.ai|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|deepseek\.com|grok\.com|meta\.ai)$
4. Drag the new channel above Referral. GA4 evaluates channels top to bottom and stops at the first match.
5. Save. The group applies to reports from the day it is created; it does not rewrite history.

Why this when GA4 has a native AI Assistant channel: the native list is Google's and was not published in full on 2026-09-30, and Perplexity is not among the examples Google names. A listed-hosts channel shows you exactly what is in it. Compare the two in Traffic acquisition before you trust either.

Suspicious direct, in Explore (a method, not a measurement)
1. Explore > Free form > Segments > New segment > Session segment.
2. Condition: Session source / medium  exactly matches  (direct) / (none)
3. Add: Landing page  does not match regex  ^(/|/index\.html)?$
4. Optional: add a rule that the session includes the event first_visit, to keep new users only.
5. Add the pages people really type or bookmark (login, contact, pricing) as further "does not match" conditions.
6. Treat the count as a list of sessions worth looking at. It is not an estimate of AI visits.
```

## 3. Looker Studio calculated field

Create a calculated field on the GA4 data source, call it "AI traffic channel", and use it as the dimension in a table or chart. The order matters: the native channel is checked first, then the listed hosts, then the direct filter.

```
CASE
  WHEN Session medium = "ai-assistant" THEN "AI Assistant (GA4 native)"
  WHEN REGEXP_MATCH(Session source, "^(.*\\.)?(chatgpt\\.com|claude\\.ai|perplexity\\.ai|gemini\\.google\\.com|copilot\\.microsoft\\.com|deepseek\\.com|grok\\.com|meta\\.ai)$") THEN "AI referrer (listed)"
  WHEN Session source = "(direct)" AND Session medium IN ("(none)", "(not set)")
       AND NOT REGEXP_MATCH(Landing page, "^(/|/index\\.html)?$") THEN "Suspicious direct"
  ELSE Session default channel group
END
```

Not pasted into a live report by the author. [[CONFIRM: field names match your connector; some connectors name the landing page field "Landing page + query string".]]

## 4. BigQuery

```sql
-- ai-traffic-atlas: classify GA4 sessions from the BigQuery export.
-- Written against the documented export schema. It has not been run against a live export by the
-- author. [[CONFIRM: run once on a real export and check the session counts against the GA4 UI.]]
-- Replace PROJECT.DATASET and the two dates. Nothing here estimates AI visits: 'suspicious_direct'
-- is a filter, and bookmarks, email links and app links pass it too.
DECLARE start_suffix STRING DEFAULT '20260901';
DECLARE end_suffix STRING DEFAULT '20260930';

WITH sessions AS (
  SELECT
    user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
    ARRAY_AGG(STRUCT(
      NULLIF((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer'), '') AS page_referrer,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
      collected_traffic_source.manual_source AS utm_source
    ) ORDER BY event_timestamp LIMIT 1)[OFFSET(0)] AS first_event,
    LOGICAL_OR(event_name = 'first_visit') AS is_new_user
  FROM `PROJECT.DATASET.events_*`
  WHERE _TABLE_SUFFIX BETWEEN start_suffix AND end_suffix
  GROUP BY user_pseudo_id, ga_session_id
),
classified AS (
  SELECT
    *,
    NET.HOST(first_event.page_referrer) AS ref_host,
    REGEXP_EXTRACT(first_event.page_location, r'^https?://[^/]+(/[^?#]*)') AS landing_path
  FROM sessions
)
SELECT
  CASE
    WHEN REGEXP_CONTAINS(ref_host, r'(^|\.)(chatgpt\.com|claude\.ai|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|deepseek\.com|grok\.com|meta\.ai)$')
      OR REGEXP_CONTAINS(IFNULL(first_event.utm_source, ''), r'(^|\.)(chatgpt\.com|claude\.ai|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|deepseek\.com|grok\.com|meta\.ai)$') THEN 'ai_referrer'
    WHEN ref_host IS NULL AND first_event.utm_source IS NULL
      AND IFNULL(landing_path, '/') NOT IN ('/', '/index.html') THEN 'suspicious_direct'
    ELSE 'other'
  END AS class,
  COUNT(*) AS sessions,
  COUNTIF(is_new_user) AS sessions_from_new_users
FROM classified
GROUP BY class
ORDER BY sessions DESC;
```

## Check your work

1. Open Reports > Acquisition > Traffic acquisition for a past full month, add Session source / medium, and search for "chatgpt".
2. Note the sessions in the AI Assistant channel and the sessions in your listed-hosts channel. They should be close for ChatGPT, Gemini and Copilot. A host that shows up in one and not the other is the thing to investigate.
3. Do not add the three numbers (native, listed, suspicious direct) together. The first two overlap, and the third is not a count of AI visits.
