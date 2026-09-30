# Suspicious direct: a method, not a measurement

Read 2026-09-30. Sources are listed at the end.

## The problem

GA4 calls a visit Direct when it has no source for it. Google's rule for the channel is that the source is exactly "(direct)" and the medium is "(not set)" or "(none)". So Direct is not "typed the address". Bookmarks, typed addresses and unlabelled links all get the same label (Clickport, quoting Google's rule).

A person who clicks a link in an AI answer can arrive with no source in several ways. Search Engine Journal lists in-app browsers, mobile apps and copied-and-pasted links. Clickport adds a referrer policy on the AI site, `rel=noreferrer` on some links, and mobile webviews. The native GA4 AI Assistant channel only captures what GA4 can identify from the referrer, so these visits stay in Direct.

Some assistants also fetch pages on the user's behalf in a way that cannot be told from a person. In one site's test, Copilot and Grok fetches looked like ordinary browsers, and a Gemini prompt produced no Google user agent at all.

## What this repo does about it

It ships a filter. It does not ship an estimate.

A session is **suspicious direct** when all of these hold:

1. Source is (direct) and medium is (none) or (not set).
2. The landing page is not the home page.
3. The session is from a new user (for a table of aggregated rows: at least 80 percent of the row's sessions are from new users; change this with `--min-new-share`).
4. The landing page is not on your own list of pages people type or bookmark (`--exclude-paths /login,/contact`).

The reasoning: a person who types your name goes to the home page, and a returning visitor is not discovering you. A new visitor who lands deep inside an article or service page with no source is someone a link sent. The link could be from an AI answer, an email, a chat app or a PDF.

## What you can say from it

- "N direct sessions landed on pages people rarely type in and came from new users." This is a fact about your data.
- "The number moved from A to B after we changed X." A trend in a filter is usable if the filter stays the same.

## What you cannot say from it

- "N visits came from AI." The filter has no way to separate AI answers from email, chat apps, QR codes and dark social.
- Any percentage of Direct that is "really AI". There is no ground truth to calibrate against, so there is no error bar. This repo does not print one, on purpose.
- Anything from a site with very few sessions. With a few dozen real sessions a month, one person's behaviour moves the number.

Clickport reaches the same place from the other side: it says you cannot estimate the ChatGPT share of Direct as a number, and suggests watching Direct, identified AI sessions and brand-name impressions in Search Console together, and treating the result as a hint.

## Checks that make it more honest

1. Run `classify` on the same export each month with the same settings, and keep the settings with the result.
2. Put the pages that get typed or bookmarked in `--exclude-paths` before you look at the output.
3. Compare the trend with Search Console brand impressions and with the identified AI sessions. If all three rise together, AI discovery may be part of it. If only suspicious direct rises, look for a campaign that lost its tags, bot traffic, or an app that dropped its tracking.
4. Tag links you control (newsletters, PDFs, social bios) so they stop landing here.

## Sources

- Clickport, "Why ChatGPT Traffic Shows as Direct in GA4". Secondary. Read 2026-09-30. <https://clickport.io/blog/chatgpt-direct-traffic-ga4>
- Search Engine Journal, "Google Analytics Adds AI Assistant As Default Channel Group", 2026-05-14. Secondary. Read 2026-09-30. <https://www.searchenginejournal.com/google-analytics-adds-ai-assistant-as-default-channel-group/574974/>
- SurfacedBy, "nginx logs: AI traffic vs referral traffic", 2026-04-19. Secondary, one site's test. Read 2026-09-30. <https://surfacedby.com/blog/nginx-logs-ai-traffic-vs-referral-traffic>
