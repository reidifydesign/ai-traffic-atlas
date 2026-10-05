# What each AI system shows a site owner

Generated from `data/matrix.json` by `npm run docs`. Do not edit by hand.

Status key: **yes** documented by the vendor or clearly shown. **partial** exists with a stated gap. **none-found** nothing found in the pages read on the read date (absence is not proof). **unverified** one secondary source or one test.

| Vendor | Owner report | Human clicks | Fetchers in logs | Owner controls |
|---|---|---|---|---|
| Google (AI Overviews, AI Mode, Gemini) | partial | partial | partial | yes |
| OpenAI (ChatGPT) | none-found | partial | yes | yes |
| Microsoft (Copilot, Bing) | partial | partial | unverified | partial |
| Perplexity | none-found | partial | yes | partial |
| Anthropic (Claude) | none-found | partial | yes | yes |
| Apple (Siri, Spotlight, Apple Intelligence) | none-found | none-found | yes | yes |
| Meta (Meta AI) | none-found | unverified | yes | partial |
| Amazon (Alexa) | none-found | none-found | yes | yes |
| Mistral (Vibe) | none-found | none-found | yes | yes |
| DuckDuckGo (AI-assisted answers) | none-found | none-found | yes | yes |
| xAI (Grok) | none-found | partial | unverified | none-found |
| DeepSeek | none-found | partial | none-found | none-found |

Questions behind the columns:

- **Owner report**: Does the vendor give site owners a report about their own site?
- **Human clicks**: What does a visit that follows a click from the AI system look like in your analytics?
- **Fetchers in logs**: Which fetchers announce themselves in your server logs, and what does each do?
- **Owner controls**: What can a site owner switch off or on?

## Google (AI Overviews, AI Mode, Gemini)

**Owner report** (partial, read 2026-09-30). Search Console has a Generative AI performance report for Search and Discover: impressions, pages, countries, devices (Search only) and dates. No clicks and no queries. Rolled out to all sites worldwide as of 2026-08-31; a site without enough data may not see it. Sources: [google-gsc-blog], [google-gsc-global].

**Human clicks** (partial, read 2026-09-30). Clicks from AI Overviews and AI Mode are counted in GA4 Organic Search, not in the AI Assistant channel, so they cannot be split out there. Gemini app clicks fall under the AI Assistant channel, which names Gemini. One site's test saw clickthrough visits arrive from gemini.google.com and google.com. Sources: [ga4-channels], [surfacedby-probe].

**Fetchers in logs** (partial, read 2026-09-30). No separate fetcher for AI Overviews or AI Mode is documented, so they cannot be told apart from Googlebot in logs. Documented user-triggered fetchers include Google-Agent and Google-GeminiNotebook. In one site's test, a Gemini prompt produced no request from any Google user agent. Sources: [google-crawlers-overview], [google-user-triggered], [surfacedby-probe].

**Owner controls** (yes, read 2026-09-30). The Google-Extended robots.txt token covers use for Gemini training and for grounding in Gemini Apps, and does not affect Search inclusion. A Search generative AI control (opt out of content appearing in or around AI Overviews and AI Mode) was reported as global on 2026-08-31. Sources: [google-common-crawlers], [google-gsc-global].

## OpenAI (ChatGPT)

**Owner report** (none-found, read 2026-09-30). No report for site owners about citations of their pages was found. The Ads Manager beta is for advertisers, not for measuring organic citations. Sources: [openai-bots], [stackadapt-chatgpt-ads].

**Human clicks** (partial, read 2026-09-30). GA4's AI Assistant channel names ChatGPT. A source tag (utm_source=chatgpt.com) is documented by OpenAI per a secondary source, and travels when the referrer is hidden. In that source's April 2026 sample of its own customers, 35.7 percent of recognised AI sessions carried a tag but no referrer. That sample is not a general rate. Sources: [ga4-channels], [clickport-direct].

**Fetchers in logs** (yes, read 2026-09-30). Four documented tokens: OAI-SearchBot (search index), GPTBot (training), ChatGPT-User (a user's action in ChatGPT, robots.txt may not apply), OAI-AdsBot (checks landing pages submitted as ads). IP ranges are published as JSON. Sources: [openai-bots].

**Owner controls** (yes, read 2026-09-30). OAI-SearchBot and GPTBot are set independently in robots.txt. Blocking OAI-SearchBot keeps the site out of ChatGPT search answers. ChatGPT-User is not used for Search decisions and may ignore robots.txt. Sources: [openai-bots].

## Microsoft (Copilot, Bing)

**Owner report** (partial, read 2026-09-30). Bing Webmaster Tools AI Performance (public preview since 2026-02-10): total citations, average cited pages per day, a sample of grounding queries, page-level citation counts and a trend. It counts citations, not rank, authority or position inside an answer. Sources: [bing-ai-performance].

**Human clicks** (partial, read 2026-09-30). GA4's AI Assistant channel names Copilot. A third party says some Copilot traffic arrives through bing.com and looks like ordinary search. Microsoft's AI Performance announcement and its crawler help page, both read on this date, do not say how Copilot clicks are referred. [[CONFIRM: no Microsoft page read states the referrer of a Copilot click.]] Sources: [ga4-channels], [measureu-regex], [bing-ai-performance], [bing-crawlers].

**Fetchers in logs** (unverified, read 2026-09-30). Microsoft's crawler help page lists Bingbot, AdIdxBot, BingPreview, MicrosoftPreview and BingVideoPreview, and lists no separate Copilot user agent. In one site's test, a Copilot fetch arrived as a plain Chrome browser and could not be told from a human. [[CONFIRM: whether Copilot's live fetches use any of Microsoft's listed agents. The test covers one site and Microsoft's page does not say.]] Sources: [bing-crawlers], [surfacedby-probe].

**Owner controls** (partial, read 2026-09-30). Bing says the report respects robots.txt and other supported content owner controls. The specific controls were not listed in the announcement. Sources: [bing-ai-performance].

## Perplexity

**Owner report** (none-found, read 2026-09-30). No site owner report was found in the pages read. Sources: [perplexity-bots].

**Human clicks** (partial, read 2026-09-30). Perplexity is not among the examples Google names for the AI Assistant channel (ChatGPT, Gemini, Deepseek, Copilot, Grok). Whether its referrals land in that channel is not stated. Check your own Referral rows for perplexity.ai. The What's New entry gives ChatGPT, Gemini and Claude as examples of popular AI assistants, so the two pages give different examples. Neither publishes the full list the channel matches. No full list of recognised sources is on any of the three Analytics Help pages read, re-read on 2026-10-05. Sources: [ga4-channels], [ga4-whats-new], [ga4-traffic-source-dimensions], [measureu-regex].

**Fetchers in logs** (yes, read 2026-09-30). PerplexityBot (search index, not used for training) and Perplexity-User (a user's action; generally ignores robots.txt). IP ranges are published as JSON. Sources: [perplexity-bots].

**Owner controls** (partial, read 2026-09-30). PerplexityBot follows robots.txt. Perplexity-User generally does not, because a person asked for the fetch. Sources: [perplexity-bots].

## Anthropic (Claude)

**Owner report** (none-found, read 2026-09-30). No site owner report was found in the pages read. Sources: [anthropic-bots].

**Human clicks** (partial, read 2026-09-30). The What's New entry gives ChatGPT, Gemini and Claude as examples of popular AI assistants in the AI Assistant channel. The channel description page gives ChatGPT, Gemini, Deepseek, Copilot and Grok as examples of sources "like" those and does not name Claude. Both are example lists, and the pages say the channel matches "a list of AI Assistants" without publishing it (all three pages re-read 2026-10-05). Whether Claude traffic lands in the channel is not stated outright. Verify in your own Traffic acquisition report. Sources: [ga4-whats-new], [ga4-channels].

**Fetchers in logs** (yes, read 2026-09-30). Three documented robots: ClaudeBot (training), Claude-SearchBot (search quality) and Claude-User (a user's request). Anthropic publishes the IP ranges it uses. One site's test saw Claude-User read robots.txt before each page fetch. Sources: [anthropic-bots], [surfacedby-probe].

**Owner controls** (yes, read 2026-09-30). Each robot is set in robots.txt, including Crawl-delay. Anthropic warns that blocking by IP address may not give a reliable opt-out, because it blocks the robots.txt read. Sources: [anthropic-bots].

## Apple (Siri, Spotlight, Apple Intelligence)

**Owner report** (none-found, read 2026-09-30). No site owner report was found in the page read. Sources: [apple-applebot].

**Human clicks** (none-found, read 2026-09-30). Nothing found on how clicks from Siri or Spotlight answers appear in analytics. Sources: [apple-applebot].

**Fetchers in logs** (yes, read 2026-09-30). Applebot identifies itself and can be verified by reverse DNS under applebot.apple.com or a published CIDR list. Its data powers search and may be used to train Apple models. Applebot-Extended is a robots.txt token, not a separate user agent. Sources: [apple-applebot].

**Owner controls** (yes, read 2026-09-30). Disallow Applebot-Extended to opt out of training. The nosnippet meta tag opts content out of broad-knowledge answers. Neither stops Applebot from crawling for search. Sources: [apple-applebot].

## Meta (Meta AI)

**Owner report** (none-found, read 2026-09-30). No site owner report was found in the page read. Sources: [meta-crawlers].

**Human clicks** (unverified, read 2026-09-30). meta.ai appears in a third party's list of AI referral domains. No Meta or Google page was read that confirms how the clicks are classified. Sources: [measureu-regex].

**Fetchers in logs** (yes, read 2026-09-30). meta-externalagent (training and indexing), meta-webindexer, meta-externalfetcher (fetches a link at a user's request, may bypass robots.txt) and meta-externalads. Sources: [meta-crawlers].

**Owner controls** (partial, read 2026-09-30). robots.txt, and Meta asks you to allow up to 24 hours for a change to apply. meta-externalfetcher may bypass it. Sources: [meta-crawlers].

## Amazon (Alexa)

**Owner report** (none-found, read 2026-09-30). No site owner report was found in the page read. Sources: [amazon-bots].

**Human clicks** (none-found, read 2026-09-30). Nothing found on how Alexa-linked visits appear in analytics. Sources: [amazon-bots].

**Fetchers in logs** (yes, read 2026-09-30). Amazonbot (improves products, may train models), Amzn-SearchBot (search, including Alexa; no training) and Amzn-User (live answers for a user; may not follow all robots.txt rules). IP lists are published. Sources: [amazon-bots].

**Owner controls** (yes, read 2026-09-30). Each agent is set independently in robots.txt, and a change can take about 24 hours. Amzn-User may not follow all directives. Sources: [amazon-bots].

## Mistral (Vibe)

**Owner report** (none-found, read 2026-09-30). No site owner report was found in the page read. Sources: [mistral-robots].

**Human clicks** (none-found, read 2026-09-30). Nothing found on how clicks from Mistral's assistant appear in analytics. Sources: [mistral-robots].

**Fetchers in logs** (yes, read 2026-09-30). MistralAI-User (a user's action in Vibe), MistralAI-Index (search index, no training) and MistralAI-Training (dataset crawling). IP lists are published. Sources: [mistral-robots].

**Owner controls** (yes, read 2026-09-30). Each token can be disallowed in robots.txt. MistralAI-User governs which sites user requests can reach. Sources: [mistral-robots].

## DuckDuckGo (AI-assisted answers)

**Owner report** (none-found, read 2026-09-30). No site owner report was found in the page read. Sources: [ddg-duckassistbot].

**Human clicks** (none-found, read 2026-09-30). Nothing found on how clicks from AI-assisted answers appear in analytics. Sources: [ddg-duckassistbot].

**Fetchers in logs** (yes, read 2026-09-30). DuckAssistBot crawls pages in real time for AI-assisted answers that cite sources, and is not used to train models. IP addresses are listed and also published as JSON. Sources: [ddg-duckassistbot].

**Owner controls** (yes, read 2026-09-30). Disallow DuckAssistBot in robots.txt; the change takes effect after 72 hours. Search rankings are not affected. Sources: [ddg-duckassistbot].

## xAI (Grok)

**Owner report** (none-found, read 2026-09-30). No site owner report was found. No xAI crawler documentation was found either. [[CONFIRM: search was not exhaustive.]] Sources: [surfacedby-probe].

**Human clicks** (partial, read 2026-09-30). GA4's AI Assistant channel names Grok, and grok.com appears in a third party's domain list. Sources: [ga4-channels], [measureu-regex].

**Fetchers in logs** (unverified, read 2026-09-30). In one site's test, a Grok fetch arrived as an ordinary Safari or Chrome browser and could not be told from a human. Sources: [surfacedby-probe].

**Owner controls** (none-found, read 2026-09-30). No documented robots.txt token was found. Sources: [surfacedby-probe].

## DeepSeek

**Owner report** (none-found, read 2026-09-30). No site owner report was found. [[CONFIRM: search was not exhaustive.]] Sources: [ga4-channels].

**Human clicks** (partial, read 2026-09-30). GA4's AI Assistant channel names Deepseek, and deepseek.com appears in a third party's domain list. Sources: [ga4-channels], [measureu-regex].

**Fetchers in logs** (none-found, read 2026-09-30). No vendor documentation of a crawler or user agent was found. Sources: [ga4-channels].

**Owner controls** (none-found, read 2026-09-30). No documented robots.txt token was found. Sources: [ga4-channels].

## Sources

- [amazon-bots] About Amazonbot (Amazon Developer). vendor. Read 2026-09-30. <https://developer.amazon.com/amazonbot>
- [anthropic-bots] Does Anthropic crawl data from the web, and how can site owners block the crawler? (Claude Help Center). vendor. Read 2026-09-30. <https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler>
- [apple-applebot] About Applebot (Apple Support). vendor. Read 2026-09-30. <https://support.apple.com/en-us/119829>
- [bing-ai-performance] Introducing AI Performance in Bing Webmaster Tools Public Preview (Bing Webmaster Blog). vendor. Published 2026-02-10. Read 2026-09-30. <https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview>
- [bing-crawlers] Which Crawlers Does Bing Use? (Bing Webmaster Tools help). vendor. Read 2026-09-30. <https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0>
- [clickport-direct] Why ChatGPT Traffic Shows as Direct in GA4 (Clickport). secondary. Read 2026-09-30. <https://clickport.io/blog/chatgpt-direct-traffic-ga4>
- [ddg-duckassistbot] What is DuckAssistBot and what does it do? (DuckDuckGo Help). vendor. Read 2026-09-30. <https://duckduckgo.com/duckduckgo-help-pages/results/duckassistbot/>
- [ga4-channels] Default channel group (Analytics Help). vendor. Read 2026-09-30. <https://support.google.com/analytics/answer/9756891>
- [ga4-traffic-source-dimensions] Traffic-source dimensions, manual tagging, and auto-tagging (Analytics Help). vendor. Read 2026-09-30. <https://support.google.com/analytics/answer/11242870>
- [ga4-whats-new] What's new in Google Analytics, entry on AI Assistant traffic measurement (Analytics Help). vendor. Published 2026-05-13. Read 2026-09-30. <https://support.google.com/analytics/answer/9164320>
- [google-common-crawlers] Google's common crawlers, including Google-Extended (Search Central). vendor. Read 2026-09-30. <https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers>
- [google-crawlers-overview] Overview of Google crawlers and fetchers (Search Central). vendor. Read 2026-09-30. <https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers>
- [google-gsc-blog] Introducing Search Generative AI performance reports in Search Console (Google Search Central Blog). vendor. Published 2026-06-03. Read 2026-09-30. <https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports>
- [google-gsc-global] Global: Google Search Console AI Performance Report & AI Control (Search Engine Roundtable). secondary. Published 2026-09-01. Read 2026-09-30. <https://seroundtable.com/google-search-console-generative-ai-tools-live-41984.html>
- [google-user-triggered] List of Google user-triggered fetchers (Search Central). vendor. Read 2026-09-30. <https://developers.google.com/search/docs/crawling-indexing/google-user-triggered-fetchers>
- [measureu-regex] AI channel grouping guide (MeasureU, lists the domains its formula covers). secondary. Read 2026-09-30. <https://measureu.com/resources/ai-channel-grouping/>
- [meta-crawlers] Meta web crawlers (Meta for Developers). vendor. Read 2026-09-30. <https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/>
- [mistral-robots] Mistral crawlers (Mistral docs). vendor. Read 2026-09-30. <https://docs.mistral.ai/robots>
- [openai-bots] Overview of OpenAI crawlers (OpenAI platform docs). vendor. Read 2026-09-30. <https://platform.openai.com/docs/bots>
- [perplexity-bots] Perplexity crawlers (Perplexity docs). vendor. Read 2026-09-30. <https://docs.perplexity.ai/guides/bots>
- [stackadapt-chatgpt-ads] Everything you need to know about advertising on ChatGPT right now (StackAdapt). secondary. Published 2026-05-28. Read 2026-09-30. <https://www.stackadapt.com/resources/blog/how-to-advertise-on-chatgpt>
- [surfacedby-probe] nginx logs: AI traffic vs referral traffic (SurfacedBy, a one-site probe). secondary. Published 2026-04-19. Read 2026-09-30. <https://surfacedby.com/blog/nginx-logs-ai-traffic-vs-referral-traffic>
