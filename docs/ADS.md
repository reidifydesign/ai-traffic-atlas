# Ads in AI answers: what changes for your reporting

As of 2026-09-30. Generated from `data/ads.json` by `npm run docs`.

ChatGPT is the only AI answer product with a documented ad programme covered here. Other vendors were not checked. [[CONFIRM: ad programmes at other AI vendors were not read.]]

OpenAI's own ads pages (ads.openai.com, help.openai.com, openai.com) returned an access block when read on 2026-09-30. Every dated fact below comes from trade press or vendor blogs quoting OpenAI, except the OAI-AdsBot line, which is from OpenAI's bots page. [[CONFIRM: re-read the OpenAI pages in a browser before quoting any row.]]

## Timeline

- **2026-02-09** OpenAI announced a test of ads in ChatGPT, starting in the United States, with stated principles of answer independence, conversation privacy, user control and trust. [stackadapt-chatgpt-ads]
- **2026-05-05** Self-serve buying opened. An ad was a card below an answer with advertiser name, favicon, a short headline (about 16 characters), a short description (about 32 characters), an image and a landing page. A carousel of cards followed in August. [ppc-land-sponsored]
- **2026-07-24** Trade press reported AppsFlyer and Adjust integrations for app installs and in-app events from ChatGPT Ads. AppsFlyer's help article carried a July 9 update stamp. [ppc-land-mmp]
- **2026-09-16** OpenAI began testing Sponsored Agents with select advertisers in the United States: after a click, a separate, labelled conversation with an agent sponsored by the advertiser, described as distinct from ChatGPT's independent answers. HubSpot and Shopify became the first CRM and ecommerce integrations. The same post added prompt-driven campaign management. [ppc-land-sponsored]

## What this changes for reporting

### paid-vs-organic-clicks

Basis: inference. Paid and organic clicks from ChatGPT may both arrive looking like chatgpt.com traffic, so the AI Assistant channel in GA4 can mix them unless the ad URL carries its own tags.

One source says the click reference OpenAI adds to ad landing URLs is called oppref, and that UTMs on the ad URL should work when the product preserves them. [[CONFIRM: whether ad clicks carry utm_source or only oppref, and what GA4 does with each.]]

What to do: Put your own utm_medium on every ad URL (for example paid-ai) so paid clicks can be filtered out of organic AI referral counts, and keep query strings intact through redirects. [hardal-measure-ads]

### ads-bot-in-logs

Basis: documented. OAI-AdsBot visits landing pages you submit as ads to check policy and relevance. Those requests are not organic citation activity and are not a person reading the page.

What to do: Count OAI-AdsBot separately from OAI-SearchBot and ChatGPT-User. The logs command does. [openai-bots]

### organic-citations-unchanged-by-design

Basis: vendor statement as reported. OpenAI's stated principle is that the answer is generated independently and ads do not change it. This is a stated design rule, not something a site owner can verify from analytics.

What to do: Do not read a change in organic ChatGPT referrals as caused or not caused by ads. There is no control group in your data. [stackadapt-chatgpt-ads] [ppc-land-sponsored]

### sponsored-agent-blind-spot

Basis: gap. A Sponsored Agent conversation happens in a separate thread, and what the advertiser receives from it was not stated in the coverage read.

[[CONFIRM: what data the advertiser receives from a Sponsored Agent conversation, how it is priced, and how the eventual site visit is referred.]]

What to do: If you run one, treat the visit that follows as a new session with unknown prior context and tag the destination URL. [ppc-land-sponsored]

### app-and-crm-measurement

Basis: secondary. App advertisers can attribute installs through AppsFlyer and Adjust, and HubSpot users get automatic UTM tagging per HubSpot partners quoted in trade press. Neither helps a site owner who does not advertise.

What to do: None needed if you do not buy ads. If you do, reconcile the ads platform's conversions with GA4 and expect them to differ. [ppc-land-mmp] [ppc-land-sponsored]

## Do not conclude

- That buying an ad changes whether you are cited in answers. The stated rule says it does not.
- That ChatGPT referral traffic in GA4 is all organic once ads exist in your market.
- That any figure about ad revenue or ad reach is a site owner measurement. A reported annual revenue run rate is a company figure and says nothing about your site.

## Sources

- [hardal-measure-ads] How to Measure ChatGPT Ads (Hardal). Read 2026-09-30. <https://usehardal.com/blog/how-to-measure-chatgpt-ads>
- [openai-bots] Overview of OpenAI crawlers (OpenAI platform docs). Read 2026-09-30. <https://platform.openai.com/docs/bots>
- [ppc-land-mmp] ChatGPT Ads gains app attribution in 7 markets as AppsFlyer, Adjust go live (PPC Land). Read 2026-09-30. <https://ppc.land/chatgpt-ads-gains-app-attribution-in-7-markets-as-appsflyer-adjust-go-live/>
- [ppc-land-sponsored] OpenAI lets advertisers run ChatGPT ads from HubSpot and Shopify (PPC Land). Read 2026-09-30. <https://ppc.land/openai-lets-advertisers-run-chatgpt-ads-from-hubspot-and-shopify/>
- [stackadapt-chatgpt-ads] Everything you need to know about advertising on ChatGPT right now (StackAdapt). Read 2026-09-30. <https://www.stackadapt.com/resources/blog/how-to-advertise-on-chatgpt>
