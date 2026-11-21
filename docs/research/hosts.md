# Phase 0 — host robots.txt and published terms (facts only)

> Captured by a helper agent on 2026-11-21 as research notes. These are leads, not evidence. Only what `docs/VERIFICATION.md` says the reviewer re-checked was re-checked. Raw page copies were kept in a session scratch directory and are not in this repository.


Robots captured 2026-11-21; terms pages read 2026-11-21 through third-party readers whose copies may be older (copy dates given where the reader reported one). User-Agent tested: `gta6-mcp/0.1 (+https://github.com/ahump20/gta6-mcp)`.
Part 1 source: `node tools/probe.mjs` from this machine, one run plus one retry of the single failed host. Raw bodies: `phase0/hosts/<label>.txt`; probe lines: `phase0/hosts/probe-robots.jsonl`.
Group matching: no robots file names `gta6-mcp`, and no named token in any file is a substring of the User-Agent string (checked by script). Path matching used `*` and `$` wildcards, longest match wins.
"No rule matches" means there is no deciding line; the path is not disallowed by the group.
Quotes marked [raw] were copied from raw page text returned by the reader. Quotes marked [model] came through WebFetch, which answers via a small model and may trim.

## www.pcgamer.com
- Robots: HTTP 200, `text/plain; charset=utf-8`, 1846 bytes, checked_at 2026-11-21T10:47:03.405Z.
- Applicable group: `*` (lines 4–29; a second `User-agent: *` at line 61 holds only Sitemap lines).
- URL `/games/grand-theft-auto/gta-6-cheats-list/`: Allowed — no rule in lines 7–29 matches. Crawl-delay: none.
- AI/LLM group: lines 36–51 name bytespider, mistralai, cohere, ai2bot, youbot, omgili, diffbot, kangaroo, img2dataset, amazonbot, amazon-qbusiness, meta-externalagent, meta-webindexer, Applebot, Applebot-Extended → `Disallow: /` (line 51).
- Terms URLs (Future plc): index https://futureplc.com/terms-conditions/ ("Last Updated: 07 April 2025"), which links US https://futureplc.com/terms-and-conditions-us/ and UK https://futureplc.com/terms-and-conditions-uk/. The index says US terms apply where main use is in the United States, UK terms in the UK and anywhere else. pcgamer.com's sign-up form links the index URL; the footer link was not read (page truncated).
- US terms, "Last Updated: 08 January 2025" [raw]: "k. use any robot, mods, hacks, spider, crawlers or other automatic device, process, software or queries that intercepts, “mines,” scrapes or otherwise accesses the Services or any part thereof to monitor, extract, copy or collect information or data from or through the Services, or engage in any manual process to do the same (in no event shall any robots.txt file or other such protocol be construed as granting written permission to engage in the conduct prohibited by this paragraph);"
- US terms [raw]: "e. use cheats, automation software (bots), hacks, modifications (mods) or any other unauthorized third-party software designed to modify the Services;"
- UK terms, "Last Updated: 07 April 2025", heading "NO TEXT OR DATA MINING, OR WEB SCRAPING" [raw]: "You shall not conduct, facilitate, authorise or permit any text or data mining or web scraping in relation to our sites or any services provided via, or in relation to, our sites for any purpose, including the development, training, fine-tuning or validation of AI systems or models. This includes using (or permitting, authorising or attempting the use of):"
- UK terms list [raw]: "Any “robot”, “bot”, “spider”, “scraper” or other automated device, program, tool, algorithm, code, process or methodology to access, obtain, copy, monitor or republish any portion of our sites or any data, content, information or services accessed via the same." / "Any automated analytical technique aimed at analysing text and data in digital form to generate information or develop, train, fine-tune or validate AI systems or models which includes but is not limited to patterns, trends and correlations."
- UK terms [raw]: "The provisions in this clause should be treated as an express reservation of our rights in this regard, including for the purposes of Article 4(3) of the Digital Copyright Directive ((EU) 2019/790)." / "This clause will not apply insofar as (but only to the extent that) we are unable to exclude or limit text or data mining or web scraping activity by contract under the laws which are applicable to us."
- Reader: Tavily extract (US, UK, index text); WebFetch (index link URLs, pcgamer.com page).

## www.gamespot.com
- Robots: HTTP 200, `text/plain; charset=utf-8`, 2676 bytes, server cloudflare, checked_at 2026-11-21T10:47:04.887Z.
- Applicable group: `*` (lines 30–32).
- URL `/articles/all-gta-6-cheats-and-how-to-unlock-them/`: Allowed — line 32 `Allow: /`. Crawl-delay: none.
- Same group, line 31: `Content-Signal: search=yes,ai-train=no,use=reference`. No `ai-input` value is given.
- Robots comment lines 1–2: "# As a condition of accessing this website, you agree to abide by the following" / "# content signals:". Lines 6–7: "# (b)  If a Content-Signal = no, you may not collect content for the" / "#      corresponding use." Lines 8–10: "# (c)  If the website operator does not include a Content-Signal for a" / "#      corresponding use, the website operator neither grants nor restricts" / "#      permission via Content-Signal with respect to the corresponding use."
- Robots comment lines 17–19: "# ai-input: inputting content into one or more AI models (e.g., retrieval" / "#           augmented generation, grounding, or other real-time taking of content for" / "#           generative AI search answers)." Line 21: "# use:      how AI systems may consume the content (immediate, reference, or full)."
- Robots comment lines 23–25: "# ANY RESTRICTIONS EXPRESSED VIA CONTENT SIGNALS ARE EXPRESS RESERVATIONS OF" / "# RIGHTS UNDER ARTICLE 4 OF THE EUROPEAN UNION DIRECTIVE 2019/790 ON COPYRIGHT" / "# AND RELATED RIGHTS IN THE DIGITAL SINGLE MARKET."
- AI/LLM groups: lines 35–127 (Cloudflare managed, "# Training crawlers") name Amazonbot, Applebot-Extended, Bytespider, CCBot, ClaudeBot, Diffbot, Google-Extended, GPTBot, omgili, anthropic-ai, Claude-Web, cohere-ai, MistralAI-Training, meta-externalagent, GoogleOther, KimiBot and others → each `Disallow: /`.
- Ownership as the page says: homepage footer reads "© 2026 Fandom, INC. All rights reserved." with links "Privacy Policy", "Terms of Use" (Tavily extract; link hrefs not returned).
- Terms URL: could not read a current GameSpot terms page. https://www.gamespot.com/terms-of-use/ returns a 2010 staff post titled "Terms of Use Agreement Update w/Notes!" (Exa fetch and Parallel fetch agree; Tavily extract "Failed to fetch url"). The footer "Terms of Use" link target was not captured (WebFetch on the homepage: HTTP 403). Fandom's terms are quoted in the fandom.com section; whether the footer points there is unverified. The Fandom terms state their own scope as [raw] "These Terms of Use apply to our websites at fandom.com, wikia.org and muthead.com, and their respective subdomains, and the mobile apps and related online and offline offerings provided under the Fandom brand (collectively, the “Services”)." GameSpot is not named in that sentence; it appears on the page only as a link under "Explore properties".
- Last updated: not available. Automated-access clauses: none read for a GameSpot-specific document.
- Reader: Tavily extract (homepage footer, no fetch time), Exa web_fetch and Parallel web_fetch (/terms-of-use/; Parallel copy dated 2026-07-25), WebFetch (403).

## www.eurogamer.net
- Robots: HTTP 200, `text/plain; charset=UTF-8`, 5678 bytes, checked_at 2026-11-21T10:47:06.273Z.
- Applicable group: `*` (lines 192–202).
- URL `/all-gta-6-cheats`: Allowed — no rule in lines 193–202 matches. Crawl-delay: none.
- Robots comment lines 1–4: "# Ziff Davis content is made available for your non-commercial use subject to our" / "# Terms of Use here: https://www.ziffdavis.com/terms-of-use" / "# Use of any robot, crawler, or other tool to scrape, harvest, extract, or retrieve any content on" / "# this website using automated means is prohibited without written permission from Ziff Davis."
- Robots comment lines 5–12: "# Prohibited uses include but are not limited to:" / "# (1) text and data mining under Art. 4 of the EU Directive on Copyright in the Digital Single" / "# Market;" / "# (2) development or operation of artificial intelligence or machine learning software or" / "# databases, including by training, fine-tuning, embedding, and retrieval-augmented generation;" / "# (3) creating data sets containing our content or sharing it with others; and" / "# (4) any commercial purposes." / "# Contact licensing@ziffdavis.com for assistance."
- AI/LLM group: lines 14–188 name about 175 agents, including training crawlers (GPTBot, ClaudeBot, CCBot) and user-triggered fetchers and coding tools (ChatGPT-User, Claude-User, Claude-Code, Cursor, Devin, opencode, Perplexity-User, FirecrawlAgent, TavilyBot, Scrapy) → `Disallow: /` (line 190) with one `Allow` at line 189.
- Terms URL: https://www.ziffdavis.com/terms-of-use (named in robots line 2). Title "Ziff Davis, LLC Terms of Use". Date as printed: "Effective September 2026".
- Clause [raw; two overlapping reader chunks joined at "development or operation of any software"]: "Except as expressly permitted, you may not (i) modify, publish, transmit, reproduce, create derivative works from, distribute, perform, display, adapt, aggregate, sell, transfer or in any way exploit any of the Content, code or Material (defined below), in whole or in part, (ii) use any robot, spider, site search and/or retrieval application, or other device to crawl, scrape, database scrape, screen scrape, harvest, gather, extract, retrieve or index any portion of the Services, or (iii) use any text, code, image, audio, video, or other content from any portion of the Services (a) for data set creation, analysis, or manipulation (including activities sometimes called “data mining,” “text and data mining,” or “TDM”) and/or (b) in connection with the development or operation of any software program, including but not limited to any artificial intelligence or machine learning model, software, or process (such as training, fine-tuning, embedding, and the like), either directly or indirectly, including through a third party (including use of a third-party dataset created in any part by prohibited means)."
- Clause [raw]: "You also agree not to circumvent, disable or otherwise interfere with any security related features of the Services or the Content, including features that prevent or restrict use or copying, or that enforce limitations on use."
- Reader: Tavily extract. WebFetch and Exa could not fetch ziffdavis.com ("unable to fetch", "SOURCE_NOT_AVAILABLE").

## www.polygon.com
- Robots: HTTP 200, `text/plain; charset=UTF-8`, 2116 bytes, server nginx, checked_at 2026-11-21T10:47:07.874Z.
- Applicable group: `*`, declared three times (lines 13–15, 72–86, 88–91).
- URL `/gta-6-cheat-codes-list-unlock/`: Allowed — no rule in those three ranges matches. Crawl-delay: none.
- Robots comment lines 1–4: "# Valnet content is made available for your non-commercial use subject to our" / "# Terms of Use here: https://www.valnetinc.com/en/terms-of-use" / "# Use of any robot, crawler, or other tool to scrape, harvest, extract, or retrieve any content on" / "# this website using automated means is prohibited without written permission from Valnet."
- Robots comment lines 5–12: same four numbered prohibited uses as the Ziff Davis text above (TDM; AI/ML "including by training, fine-tuning, embedding, and retrieval-augmented generation"; data sets; "any commercial purposes"), ending "# Contact info@valnetinc.com for assistance."
- AI/LLM groups: lines 17–66 name GPTBot, Google-Extended, Applebot-Extended, anthropic-ai, Bytespider, CCBot, ChatGPT-User, ClaudeBot, Claude-Web, Diffbot, FacebookBot, ImagesiftBot, Omgilibot, Omgili, PerplexityBot, YouBot → each `Disallow: /`.
- Terms URL: https://www.valnetinc.com/en/terms-of-use (named in robots line 2). Date as printed: "These Terms were last updated on January 12, 2026."
- Clauses (list of prohibited acts) [raw]: "Use manual or automated software, devices, or other processes to “crawl” or “spider” any page of the Sites;" / "Frame, scrape, automatically download, data-mine, extract, collect, or harvest any content (including without limitation User Submissions and Mods) from the Sites in any form and by any means;" / "Use or copy any content from the Sites for the development of any software program, including, without limitation, training a machine learning or artificial intelligence (AI) system;"
- Clause [raw]: "Bypass, circumvent or attempt to bypass or circumvent any restricted access to the Sites (or other accounts, computer systems or networks connected to the Sites);"
- Reader: Tavily extract.

## www.ign.com
- Robots: HTTP 200, `text/plain`, 14390 bytes, retry-after "0", checked_at 2026-11-21T10:47:09.260Z.
- Applicable group: `*` (lines 14–29).
- URL `/wikis/gta-6`: Allowed — no rule in lines 15–29 matches (nearest: line 27 `Disallow: /wikis/*/edit`, line 28 `Disallow: /wikis/*/compare/*`). Crawl-delay: none.
- Robots comment lines 1–12: identical wording to the Eurogamer comment above (Ziff Davis; "prohibited without written permission from Ziff Davis"; the four numbered prohibited uses; licensing@ziffdavis.com).
- AI/LLM groups: "#block crawlers" lines 32–45 (Amzn-SearchBot, ApifyBot, ChatGPT-User, ExaBot, FirecrawlAgent, GPTBot, OAI-SearchBot, opencode, Trae and others) → `Disallow: /` (line 49). "#Block AI content scrapers" lines 52–226 (agent list identical to Eurogamer lines 14–188 by diff, including Claude-User, Claude-Code, Cursor, Devin) → `Disallow: /` (line 357) after an Allow list of named pages; that list has gta-5 and san-andreas wiki pages but no `/wikis/gta-6` entry (the only gta-6 line in the file is an article Allow at line 261).
- Terms URL: https://www.ziffdavis.com/terms-of-use (named in robots line 2). Date as printed: "Effective September 2026".
- Clauses: the same Ziff Davis document quoted in the eurogamer.net section.
- Reader: Tavily extract.

## www.rockstargames.com
- Robots: HTTP 200, `text/plain; charset=UTF-8`, 311 bytes, checked_at 2026-11-21T10:47:10.632Z.
- Applicable group: none. The file has no `*` group and no group naming `gta6-mcp`.
- URL `/newswire/article/39akk424a9oo53/grand-theft-auto-vi-now-available`: Allowed — no group applies, so no rule applies. Crawl-delay: none.
- AI/LLM groups: the whole file (lines 1–23) is eight named groups — ia_archiver, Applebot-Extended, CCBot, cohere-ai, cohere-training-data-crawler, ClaudeBot, GPTBot, Meta-ExternalAgent — each `Disallow: /`.
- Terms URL: https://www.rockstargames.com/legal (page heading "Legal", text calls itself "Terms of Service"). Date as printed, readers disagree: Tavily extract copy "Last Updated: February 28, 2025" (same copy the clauses below came from; it cites "Section 4" for Virtual Items); Exa copy "Last Updated: January 29, 2024." (cites "Section 3"). Neither reader gave a fetch time.
- Clause [raw]: "The limited license granted in this Agreement does not give you any right to, and you may not, sell, copy (except under applicable legal exceptions such as the “private copy” exception under applicable law), loan, lease, distribute, disassemble, decompile, decrypt, hack, derive source code from, reverse engineer (except where permitted under applicable legal exceptions deriving from EU Directive 2009/24 or other applicable law), modify, create derivative works, commercialize, or otherwise exploit the Services (including the Content), Virtual Items, or your Account unless subject to separate, express written terms provided by Rockstar permitting such conduct."
- Clause [raw; two overlapping reader chunks joined at "authorizes the use of the Services"]: "Without limiting the foregoing, nothing in the limited license granted in this Agreement authorizes the use of the Services (including the Content), Virtual Items, or your Account in any manner to develop, train, enhance, or provide source material for, or promote, any Generative AI Tools; and any such uses are hereby explicitly prohibited."
- Clause [raw]: "“Generative AI Tools” means any tool or computer program that uses algorithms or technology commonly known as artificial intelligence or machine learning to create or generate content such as, but not limited to, software code, written text, still or moving images, musical works, human voice emulation, audio material, or other creative works based on text, image, sound prompts, or other inputs."
- Clause, Section 6 list item (3) [raw]: "You will not use, promote, or make available any bug, glitch, exploit, cheat, “mod menu,” hack, script, bot, unauthorized mod, or other methods that interact with the Services resulting in a breach this Agreement. This includes any such methods that collect information or user data; exploit system vulnerabilities; circumvent content moderation or filtering systems; or otherwise intercept, redirect, or interfere with the operation of the Services as intended."
- Not found by the reader on this page: the words robot, spider, scrape, crawl or "data mining" (two keyword-ranked extracts; the full page was not read end to end). "7.5. Use of Automated Systems." concerns Rockstar's own moderation systems.
- Reader: Tavily extract (clauses and 2025 date), Exa web_fetch (2024 date and opening). WebFetch returned only the page title.

## support.rockstargames.com
- Robots: unavailable from the runtime path. Attempt 1 checked_at 2026-11-21T10:47:12.016Z: "TimeoutError: The operation was aborted due to timeout" (20 s, no HTTP response, no hops). Attempt 2 (the one permitted retry) checked_at 2026-11-21T10:47:44.857Z: same error. No body saved.
- Applicable group: unknown. URL `/articles/4QfG4FmZCf5W1gS8jy4UVT/grand-theft-auto-vi-platform-editions-and-versions`: no verdict — robots.txt not retrieved. Crawl-delay: unknown.
- Terms: same document as www.rockstargames.com (https://www.rockstargames.com/legal; date as recorded in that section), which covers "our games, apps, products, websites, and other services". No separate support-site terms page was looked for.
- Reader: n/a for robots; terms as above.

## www.take2games.com
- Robots: HTTP 200, `text/plain`, 178 bytes, server CloudFront, checked_at 2026-11-21T10:47:33.120Z.
- Applicable group: `*` (lines 1–7).
- URL `/ir/news/rockstar-games-announces-grand-theft-auto-vi-now-available`: Allowed — no rule in lines 3–7 matches. Crawl-delay: none.
- AI/LLM groups: none in the file.
- Terms URL: https://www.take2games.com/legal ("Take-Two Terms of Service"). Date as printed: "Last Updated: February 28, 2025" (Tavily and Exa copies agree). This is a separate document from Rockstar's, with near-identical clause wording.
- Clause [raw]: "2.3. Restrictions. The limited license granted in this Agreement does not give you any right to, and you may not, sell, copy (except under applicable legal exceptions such as the “private copy” exception under applicable law), loan, lease, distribute, disassemble, decompile, decrypt, hack, derive source code from, reverse engineer (except where permitted under applicable legal exceptions deriving from EU Directive 2009/24 or other applicable law), modify, create derivative works, commercialize, or otherwise exploit the Services (including the Content), Virtual Items, or your Account unless subject to separate, express written terms provided by Take-Two permitting such conduct."
- Clause [raw; reader chunk starts mid-sentence]: "license granted in this Agreement authorizes the use of the Services (including the Content), Virtual Items, or your Account in any manner to develop, train, enhance, or provide source material for, or promote, any Generative AI Tools; and any such uses are hereby explicitly prohibited." followed by the same "Generative AI Tools" definition as quoted for Rockstar.
- Clause, Section 6 list item (3) [raw]: "You will not use, promote, or make available any bug, glitch, exploit, cheat, “mod menu,” hack, script, bot, unauthorized mod, or other methods that interact with the Services resulting in a breach this Agreement. This includes any such methods that to collect information or user data; exploit system vulnerabilities; circumvent content moderation or filtering systems; or otherwise intercept, redirect, or interfere with the operation of the Services as intended."
- Not found by the reader on this page: robot, spider, scrape, crawl, "data mining" (same limit as for Rockstar).
- Reader: Tavily extract (clauses and date), Exa web_fetch (date and opening). No fetch time given by either.

## www.playstation.com
- Robots: HTTP 200, `text/plain;charset=iso-8859-1`, 655 bytes, checked_at 2026-11-21T10:47:34.558Z.
- Applicable group: `*`, declared three times (lines 3–10, 12–13, 24–25).
- URL `/en-us/games/grand-theft-auto-vi/`: Allowed — no rule in lines 5–10 or 25 matches. Crawl-delay: line 13 `Crawl-delay: 5`.
- AI/LLM groups: none. Other named groups: AhrefsBot, YandexBot, bingbot (`Crawl-delay: 10`), Algolia Crawler, PetalBot (`Disallow: /`).
- Terms URL: https://www.playstation.com/en-us/legal/terms-of-use/ ("Website Terms of Use (US)"). Date as printed, at the end of the page: "Last Updated March 11, 2026".
- Clause heading [raw]: "10. NO TEXT MINING, DATA MINING or AI TRAINING"
- Clause [raw]: "You shall not conduct, facilitate, authorize or permit any text or data mining or web scraping in relation to our site or any services provided via, or in relation to, our site for any purpose, including the development, training, fine-tuning or validation of AI systems or models. This includes using (or permitting, authorizing or attempting the use of):"
- Clause list items [model; returned in segments, joined in order]: "Any "robot", "bot", "spider", "scraper" or other automated device, program, tool, algorithm, code, process or methodology to access, obtain, copy, monitor or republish any portion of our site or any data, content, information or services accessed via the same; and" / "Any automated analytical technique aimed at analyzing text and data in digital form to generate information or develop, train, fine-tune or validate AI systems or models which includes but is not limited to patterns, trends and correlations."
- Clause [raw]: "The provisions in this clause should be treated as an express reservation of our rights in this regard, including for the purposes of Article 4(3) of the Digital Copyright Directive (EU) 2019/790." / "This clause will not apply only to the extent that we are unable to exclude or limit text or data mining or web scraping activity by contract under the laws which are applicable to SIE."
- Clause [raw]: "We give you permission to use the Content to surf and view our Sites, which means displaying or loading the Content on your device in connection with typical web browsing activity. And we give you permission to use the Content for your personal, non-commercial uses. You do not have our permission to distribute the Content, publicly display it, charge any fee for it, use it to create your own website, construct a database with it or replicate our Sites or any parts of them elsewhere."
- Reader: Tavily extract ([raw] items), WebFetch ([model] list items and date position).

## www.xbox.com
- Robots: HTTP 200, `text/plain; charset=UTF-8`, 289 bytes, checked_at 2026-11-21T10:47:35.887Z.
- Applicable group: `*` (lines 1–10).
- URL `/en-US/games/grand-theft-auto-vi`: Allowed — no rule in lines 2–10 matches. Crawl-delay: none.
- AI/LLM groups: none in the file.
- Terms URL: https://www.microsoft.com/en-us/legal/terms-of-use ("Microsoft – Terms of Use"). The xbox.com page footer "Terms of use" link is https://go.microsoft.com/fwlink/?LinkID=206977, which answers 302 to that URL. Date as printed: "Last Updated: February 7, 2022".
- Clause, "No Unlawful or Prohibited Use" [raw]: "You may not use the Services in any manner that could damage, disable, overburden, or impair any Microsoft server, or the network(s) connected to any Microsoft server, or interfere with any other party's use and enjoyment of any Services. You may not attempt to gain unauthorized access to any Services, other accounts, computer systems or networks connected to any Microsoft server or to any of the Services, through hacking, password mining or any other means. You may not obtain or attempt to obtain any materials or information through any means not intentionally made available through the Services."
- Clause, "AI Services" [raw]: "Extracting Data. You may not use web scraping, web harvesting, or web data extraction methods to extract data from the AI services." / "Limits on use of data from the AI Services.You may not use the AI services, or data from the AI services, to create, train, or improve (directly or indirectly) any other AI service." The section defines these as "services that are labeled or described by Microsoft as including, using, powered by, or being an Artificial Intelligence (“AI”) system."
- Clause, "Use of Services" list [model]: "Harvest or otherwise collect information about others, including e-mail addresses."
- Reported "not found" on this page by WebFetch: robots, spiders, bots, data mining.
- Second linked document, not read: xbox.com footer also links Community Standards (https://www.xbox.com/en-US/legal/community-standards). The Microsoft Services Agreement (https://www.microsoft.com/en-us/servicesagreement, "Published: July 30, 2026", "Effective: September 30, 2026", has an "XBOX" section) was opened once by Tavily; only its header and contents list came back, so no clause is quoted and it is unknown whether it has an automated-access clause.
- Reader: Tavily extract ([raw] items and date), WebFetch (footer link URLs, redirect, [model] item).

## fandom.com
- Robots: not in the Part 1 host list; not probed.
- Terms URL: https://www.fandom.com/terms-of-use ("Terms of Use | Fandom"). Date as printed: "Date of Last Revision: December 19, 2025". The page lists previous versions dated October 14, 2025, October 13, 2025 and May 24, 2022.
- Clauses, "User conduct" [raw]: "Except as expressly permitted by the Company (for example with respect to the use of text content that is submitted to particular Fandom communities as permitted as set forth at our licensing page), you may not modify, publish, transmit, reproduce, scrape, create derivative works from, distribute, perform, adapt, aggregate, sell, transfer or in any way exploit any of the content, in whole or in part,"
- Clause [raw]: "Use any robot, spider, site search and/or retrieval application, or other device to scrape, extract, retrieve or index any portion of the content;"
- Clause [raw]: "Without our express, prior written consent, use or copy the content for the development of any software program, including, but not limited to, training a machine learning or artificial intelligence (AI) system"
- Clause, later list [raw]: "not use any robot, spider, scraper or other automated means to access the Services for any purpose without our express written permission;"
- Licence, https://www.fandom.com/licensing [raw]: "Except where otherwise permitted, the text on Fandom communities (known as “wikis”) is licensed under the Creative Commons Attribution-Share Alike License 3.0 (Unported) (CC BY-SA)." Name and version stated: Creative Commons Attribution-Share Alike License 3.0 (Unported).
- Licensing page [raw]: "Some wikis use licenses other than the CC BY-SA license. The license used by an individual wiki is made clear on the edit page of that wiki." The page also describes wikis under CC BY-NC, CC BY-NC-SA and CC BY-NC-ND.
- Licensing page [raw]: "Such use is allowed where attribution is given and the same freedom to re-use and re-distribute applies to any derivative works of the contributions."
- Bot use, https://community.fandom.com/wiki/Help:Bots [raw]: "A bot is a program or script that automatically edits wiki pages." / "Bots on Fandom must use a limited editing rate so that they don't overload Fandom's servers." / "However, if you find your bot making more than one edit per second , then it's time to slow it down."
- Help:Bots [raw]: "To log in with a bot, you must generate special credentials using Special:BotPasswords." / "To request a bot flag, contact Fandom Staff". The excerpts read cover editing bots; nothing in them addresses read-only retrieval.
- API use, https://community.fandom.com/wiki/Help:API: could not read. Parallel fetch: HTTP 403. WebFetch: HTTP 402 Payment Required. Tavily extract: "Failed to fetch url".
- Reader: Parallel web_fetch (terms, copy dated 2026-11-06; Help:Bots, copy dated 2026-11-13); Tavily extract (licensing, no fetch time). Tavily failed on the terms page and Help:Bots.

## Readers and limits
- Copy dates: Parallel reported one per page (given above). Tavily, Exa and WebFetch reported none, so those pages are "as served to the reader on 2026-11-21", possibly from cache.
- Firecrawl was not used: the account returned "Insufficient credits" on the first three calls.
- Every [raw] quote came from keyword-ranked excerpts, not an end-to-end read; a clause the ranking missed would not appear here.
- Terms URLs for Ziff Davis and Valnet come from the sites' own robots.txt; Microsoft's from the xbox.com footer; Future's from a pcgamer.com form link. Rockstar, Take-Two, PlayStation and Fandom URLs were opened directly, not followed from a footer.
