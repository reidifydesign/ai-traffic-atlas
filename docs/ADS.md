# Ads in AI answers: what changes for your reporting

As of 2026-09-30. Generated from `data/ads.json` by `npm run docs`.

ChatGPT is the only AI answer product with a documented ad programme covered here. Other vendors were not checked. [[CONFIRM: ad programmes at other AI vendors were not read.]]

OpenAI's own ads pages (ads.openai.com, help.openai.com, openai.com) returned an access block to an automated fetch earlier on 2026-09-30. They were then read in a real browser on the same day, and the rows below cite OpenAI's pages wherever OpenAI states the fact. Trade press is kept only where no OpenAI page read says it. One item is still trade press only: the carousel of ad cards reported for August. [[CONFIRM: no OpenAI page read states the carousel format or its date.]]

## Timeline

- **2026-01-16** OpenAI said it planned to start testing ads in the United States on the Free and Go tiers, and listed its ads principles: answer independence, conversation privacy, choice and control, long-term value. It said Plus, Pro, Business and Enterprise would not include ads. [openai-ads-principles]
- **2026-02-09** OpenAI began testing ads in ChatGPT in the United States, for logged-in adults on the Free and Go tiers. OpenAI's help FAQ gives this date as the start of ad testing. The test placed ads below answers, labelled as sponsored and visually separate from the answer. [openai-testing-ads] [openai-ads-faq]
- **2026-05-05** OpenAI began rolling out a beta self-serve Ads Manager and added cost-per-click bidding; before this, ads were bought on a CPM basis. On the read date, OpenAI's help pages say an ad is shown below a response with advertiser name, favicon, title, copy, landing page and an image. Its bulk upload checklist gives titles 16 to 24 characters recommended and 50 maximum, and copy 32 to 48 characters recommended and 100 maximum. [openai-new-ways-to-buy] [openai-ads-basics] [openai-ads-bulk-schema]
- **2026-07-24** Trade press reported AppsFlyer and Adjust integrations for app installs and in-app events from ChatGPT Ads. On the read date, OpenAI's help article lists AppsFlyer, Adjust, Branch and Singular as the supported mobile measurement partners, and says attribution through them is click-based. [ppc-land-mmp] [openai-ads-mmp]
- **2026-08-11** OpenAI said ChatGPT Ads had launched in the United Kingdom, Mexico, Brazil, Japan and South Korea. [openai-testing-ads]
- **2026-08-18** OpenAI announced ChatGPT Ads for 31 European markets, reached first through its Ads Solutions team and agency and technology partners. An update dated 2026-08-31 says self-service access through Ads Manager is available in those markets. [openai-ads-europe]
- **2026-09-16** OpenAI began testing Sponsored Agents with select advertisers in the United States: after clicking an ad, a person can start a labelled conversation with an agent sponsored by the business, described as distinct from ChatGPT's independent answers and separate from the original conversation. HubSpot and Shopify became the first CRM and ecommerce integrations. The same post added an Ads Manager plugin for natural-language campaign management in ChatGPT. [openai-reimagining-ads] [openai-sponsored-agents-help]
- **2026-09-23** OpenAI said ChatGPT Ads was rolling out in Indonesia, Malaysia, the Philippines, Singapore, Thailand, Vietnam and Taiwan, and was available in more than 60 countries. Its Ads Manager availability page lists which countries have self-service access and says the advertising legal entity must be based in a listed country. [openai-ads-asia] [openai-ads-availability]

## What this changes for reporting

### paid-vs-organic-clicks

Basis: inference. Paid and organic clicks from ChatGPT may both arrive looking like chatgpt.com traffic, so the AI Assistant channel in GA4 can mix them unless the ad URL carries its own tags.

OpenAI documents its click reference as oppref, which it says is appended to the end of the landing page URL, and says the OpenAI Pixel stores it in a first-party cookie. OpenAI also says static tracking parameters such as UTMs that an advertiser adds to landing page URLs persist on ad clicks, and that Ads Manager supports dynamic URL parameters with the macros {campaign_id}, {ad_group_id}, {ad_id} and {ad_account_id}. No page read says OpenAI adds a utm_source of its own. [[CONFIRM: whether OpenAI adds any utm_ parameter by itself, and how GA4 groups a paid ChatGPT click. Neither is stated on the pages read.]]

What to do: Put your own utm_medium on every ad URL (for example paid-ai) so paid clicks can be filtered out of organic AI referral counts, and keep query strings, including oppref, intact through redirects. [openai-ads-conversion] [openai-ads-basics] [openai-ads-measure] [hardal-measure-ads]

### clicks-differ-from-sessions

Basis: documented. Clicks in OpenAI's Ads Manager and sessions in GA4 will not match. OpenAI's own help page lists page load, redirects, consent settings, browser blocking, UTM handling, attribution windows and time zones as reasons.

What to do: Compare the same date range and time zone, and treat a gap as normal before treating it as a tagging fault. [openai-ads-measure] [openai-ads-conversion]

### ads-bot-in-logs

Basis: documented. OAI-AdsBot visits landing pages you submit as ads to check policy and relevance. Those requests are not organic citation activity and are not a person reading the page. OpenAI says advertisers must allow OAI-AdsBot, recommends allowing OAI-SearchBot too, and may use landing page content to decide when to show the ad.

What to do: Count OAI-AdsBot separately from OAI-SearchBot and ChatGPT-User. The logs command does. [openai-bots] [openai-ads-crawlers]

### organic-citations-unchanged-by-design

Basis: vendor statement. OpenAI's stated principle is that the answer is generated independently and ads do not change it, and its FAQ says ads run on separate systems from the chat model. This is a stated design rule, not something a site owner can verify from analytics.

What to do: Do not read a change in organic ChatGPT referrals as caused or not caused by ads. There is no control group in your data. [openai-ads-principles] [openai-ads-faq]

### sponsored-agent-blind-spot

Basis: gap. A Sponsored Agent conversation happens in a separate thread. OpenAI's help page calls the format a limited alpha for selected advertisers and says it is not taking early access requests. OpenAI's FAQ says that when a person messages an advertiser through an ad, the advertiser sees only the messages that person sends to it, and that advertisers otherwise get aggregated reporting such as views and clicks.

[[CONFIRM: how Sponsored Agents are priced and how the eventual site visit is referred. Neither is stated on the OpenAI pages read.]]

What to do: If you run one, treat the visit that follows as a new session with unknown prior context and tag the destination URL. [openai-sponsored-agents-help] [openai-ads-faq] [openai-reimagining-ads]

### app-and-crm-measurement

Basis: vendor statement, UTM detail secondary. App advertisers can attribute installs through AppsFlyer, Adjust, Branch and Singular, and OpenAI says HubSpot users can connect an account, create ads, track performance and follow up on leads in HubSpot. A trade press report says HubSpot applies UTM tagging automatically; no OpenAI page read says so. Neither integration helps a site owner who does not advertise.

What to do: None needed if you do not buy ads. If you do, reconcile the ads platform's conversions with GA4 and expect them to differ. [openai-ads-mmp] [openai-reimagining-ads] [ppc-land-sponsored]

## Do not conclude

- That buying an ad changes whether you are cited in answers. The stated rule says it does not.
- That ChatGPT referral traffic in GA4 is all organic once ads exist in your market.
- That any figure about ad revenue or ad reach is a site owner measurement. A reported annual revenue run rate is a company figure and says nothing about your site.

## Sources

- [hardal-measure-ads] How to Measure ChatGPT Ads (Hardal). Read 2026-09-30. <https://usehardal.com/blog/how-to-measure-chatgpt-ads>
- [openai-ads-asia] ChatGPT Ads expands to Southeast Asia and Taiwan (OpenAI). Read 2026-09-30. <https://openai.com/index/chatgpt-ads-expands-southeast-asia-taiwan/>
- [openai-ads-availability] Ads Manager Availability (OpenAI Help Center). Read 2026-09-30. <https://help.openai.com/en/articles/20001245-ads-manager-availability>
- [openai-ads-basics] Ads in ChatGPT: The Basics (OpenAI Help Center). Read 2026-09-30. <https://help.openai.com/en/articles/20001207-ads-in-chatgpt-the-basics>
- [openai-ads-bulk-schema] Bulk Upload Campaign Schema Checklist (OpenAI Help Center). Read 2026-09-30. <https://help.openai.com/en/articles/20001218-bulk-upload-campaign-schema-checklist>
- [openai-ads-conversion] Conversion Measurement (OpenAI Help Center). Read 2026-09-30. <https://help.openai.com/en/articles/20001409-conversion-measurement>
- [openai-ads-crawlers] Advertiser Guidance for Allowing OpenAI Web Crawlers (OpenAI Help Center). Read 2026-09-30. <https://help.openai.com/en/articles/20001243-advertiser-guidance-for-allowing-openai-web-crawlers>
- [openai-ads-europe] ChatGPT Ads expands across Europe (OpenAI, with an update dated 2026-08-31). Read 2026-09-30. <https://openai.com/index/chatgpt-ads-expands-across-europe/>
- [openai-ads-faq] Ads in ChatGPT (OpenAI Help Center FAQ). Read 2026-09-30. <https://help.openai.com/en/articles/20001047-ads-in-chatgpt>
- [openai-ads-measure] Measure Results (OpenAI Help Center). Read 2026-09-30. <https://help.openai.com/en/articles/20001214-measure-results>
- [openai-ads-mmp] Set up Mobile Measurement Partner Integrations (OpenAI Help Center). Read 2026-09-30. <https://help.openai.com/en/articles/20001372-set-up-mobile-measurement-partner-integrations>
- [openai-ads-principles] Our approach to advertising and expanding access to ChatGPT (OpenAI). Read 2026-09-30. <https://openai.com/index/our-approach-to-advertising-and-expanding-access/>
- [openai-bots] Overview of OpenAI crawlers (OpenAI platform docs). Read 2026-09-30. <https://platform.openai.com/docs/bots>
- [openai-new-ways-to-buy] New ways to buy ChatGPT ads (OpenAI). Read 2026-09-30. <https://openai.com/index/new-ways-to-buy-chatgpt-ads/>
- [openai-reimagining-ads] Reimagining advertising with AI (OpenAI). Read 2026-09-30. <https://openai.com/index/reimagining-advertising-with-ai/>
- [openai-sponsored-agents-help] Sponsored Agents in ChatGPT Ads (OpenAI Help Center). Read 2026-09-30. <https://help.openai.com/en/articles/20001524-sponsored-agents-in-chatgpt-ads>
- [openai-testing-ads] Testing ads in ChatGPT (OpenAI, with dated updates). Read 2026-09-30. <https://openai.com/index/testing-ads-in-chatgpt/>
- [ppc-land-mmp] ChatGPT Ads gains app attribution in 7 markets as AppsFlyer, Adjust go live (PPC Land). Read 2026-09-30. <https://ppc.land/chatgpt-ads-gains-app-attribution-in-7-markets-as-appsflyer-adjust-go-live/>
- [ppc-land-sponsored] OpenAI lets advertisers run ChatGPT ads from HubSpot and Shopify (PPC Land). Read 2026-09-30. <https://ppc.land/openai-lets-advertisers-run-chatgpt-ads-from-hubspot-and-shopify/>
