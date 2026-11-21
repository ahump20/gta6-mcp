# Phase 0 verification log

Every row is something observed with a tool on 2026-11-21 (UTC), from the machine
and network path that runs the server (macOS, Node v24.5.0, npm 11.5.1), unless a
row says otherwise. Supplied claims from the build brief are treated as leads.
"Reasoned" marks an inference; everything else was read directly.

Reviewer for all entries: **Claude (AI agent, Anthropic), acting as implementing
agent**. No gameplay test was performed by anyone involved in this build.

## 1. Launch, platforms, PC, online

| Claim | Source (exact URL) | Published | checked_at | Observed | Uncertainty |
| --- | --- | --- | --- | --- | --- |
| GTA VI is available now on PS5 and Xbox Series X\|S | https://www.rockstargames.com/newswire/article/39akk424a9oo53/grand-theft-auto-vi-now-available | listed "November 19, 2026" on https://www.rockstargames.com/VI | 10:10:35Z | HTTP 200. Page `<meta name="description">`: "Today we are proud to announce that Grand Theft Auto VI is now available worldwide for PlayStation 5 and XBOX Series X\|S." | Article body is rendered client-side and was not read; only title and meta description were. |
| Same, from the publisher | https://www.take2games.com/ir/press-releases | 2026-11-19 | 10:14:50Z | HTTP 200. Listing shows "November 19, 2026 Rockstar Games Announces Grand Theft Auto VI Now Available" and "November 20, 2026 Grand Theft Auto VI Shatters Entertainment Box Office Records with $3.79 Billion in Day One Retail Sales". | Release bodies not read here; see section 6. |
| PS5 is a native release | https://www.playstation.com/en-us/games/grand-theft-auto-vi/ | n/a | 10:14:51Z | HTTP 200. "Platform: PS5 Release: 11/19/2026", "Available on PS5", "PS5 Pro Enhanced", "Offline play enabled", "1 player". | US store page only. |
| Xbox Series X\|S is native; Xbox One is cloud streaming only | https://www.xbox.com/en-US/games/grand-theft-auto-vi | n/a | 10:14:53Z | HTTP 200. "Platforms XBOX Series X\|S Cloud *", "Release date November 19, 2026", "XBOX One players can also experience the game with XBOX Cloud Gaming *". | The footnote text behind "*" was not read. |
| Rockstar Support statement on platforms or cheats | https://support.rockstargames.com/ | n/a | 10:13:57Z and 10:14:23Z | Two requests from Node timed out after 25 s; two earlier fetches by a separate tool timed out after 60 s. | **Unavailable.** No Rockstar Support content was read. |
| Game mode | https://en.wikipedia.org/w/api.php?action=parse&page=Grand_Theft_Auto_VI&prop=wikitext&section=1 | rev 1386910091 | 10:19Z | "''Grand Theft Auto VI'' is a [[single-player]], [[action-adventure game]]". | Wiki text, source-reported. |
| PC version | Wikipedia Release section, rev 1386908820 (section 14) | 2026-10-13 reports | 10:11Z | "In October 2026, industry sources reported that a PC release is expected in the first quarter of 2027", cited to Tom's Hardware and The Verge, both dated 13 October 2026. No official PC announcement was found on the Rockstar, PlayStation or Xbox pages read above. | A report, not an announcement. Absence on the pages read is not proof that none exists. |
| Online mode | same section | 2020–2022 reports | 10:11Z | An explanatory note attributes "a significant online mode" to Jason Schreier (Bloomberg). No online mode appears on the PlayStation page ("1 player", "Offline play enabled"). | Historical reporting about plans. See section 6 for the "2027" lead. |

Historical dates recorded for context, all from Wikipedia rev 1386908820: first
trailer December 2023 (2025 window), delay to 26 May 2026 announced May 2025,
delay to 19 November 2026 announced November 2025.

## 2. Cheats: what the sources say

| Claim | Source | Published / revision | checked_at | Observed | Uncertainty |
| --- | --- | --- | --- | --- | --- |
| "61 cheats" | https://www.pcgamer.com/games/grand-theft-auto/gta-6-cheats-list/ | published 2026-11-18T11:00Z, modified 2026-11-19T15:42:12Z, authors Sean Martin; Christopher Livingston | 10:10:35Z | HTTP 200, 1,889,510 bytes; the cheat tables start past byte 1,107,508. 61 data rows across five tables; 19 have a sequence, 42 show "???". | The number 61 is a count of rows on this page, made by this build. |
| Same | https://web.archive.org/web/20261118184639id_/https://www.gamespot.com/articles/all-gta-6-cheats-and-how-to-unlock-them/ | published 2026-11-18T12:13:22Z, modified 12:18:23Z, author Cheri Faulkner | archive capture 2026-11-18T18:46:39Z, fetched 10:11:50Z | HTTP 200 from the archive, 248,985 bytes (the CDX index lists this capture with status "204"; the body is the article). 61 "cheat code:" lines, 18 with a sequence. | Three-day-old archive. The live page returned HTTP 403 with a Cloudflare "Just a moment..." challenge at 10:10:35Z, so GameSpot's **current** wording is unavailable. |
| Entry method | PC Gamer, same page | as above | 10:10:35Z | "Press ↑ on the D-pad to open your phone", "Hold L1 and press R1", "Input the listed command". | No platform is named anywhere in the article body. L1/R1 are PlayStation labels, which is not a platform statement. |
| Entry method | GameSpot archive | as above | 10:11:50Z | "All of the GTA 6 cheats are entered by opening your phone, holding L1 + R1, and pressing the directional inputs on the D-pad." | Differs from PC Gamer ("hold L1 and press R1"). |
| Unlock condition | both | as above | as above | PC Gamer: "you need to complete the main story". GameSpot: "you're going to have to beat the game at least once". Both: using a cheat blocks saving. | Source-reported. |
| What each guide says it tested | PC Gamer | as above | 10:10:35Z | "We loaded a save to test if cheat commands work earlier in the game and they don't." | **A test of when cheats unlock, nothing else.** No input, effect or platform test is claimed. |
| What each guide says it tested | GameSpot archive | as above | 10:11:50Z | "We loaded a fresh save to test that, so you don't have to." (about using codes before the prerequisites) | Same: unlock timing only. |
| Outstanding inputs | PC Gamer | as above | 10:10:35Z | "I'll continue to update the entries as we puzzle out more." 42 rows show "???". | "???" is an omission by the source, not a statement that the input is undiscovered. |
| PC or keyboard entry | all of the above | | | No PC or keyboard entry method is documented for GTA VI in any source read. | Treated as speculative; the server emits no PC rows. |

### The Fandom page copies GameSpot

https://gta.fandom.com/api.php?action=parse&page=Cheats+in+GTA+VI (rev 2089363,
2026-11-19T17:14:40Z, checked 10:07:17Z) lists 18 cheats and cites one source:
GameSpot, 18 November 2026. Its 18 sequences match GameSpot's 18 archived
sequences one for one, including the malformed last token in Vehicle Force
("Left, Up Down", missing a comma). **Reasoned:** the wiki rows share GameSpot's
origin and are not an independent report.

### Attack Force: two captured variants

| Variant | Source | Captured | Text |
| --- | --- | --- | --- |
| 9 inputs | PC Gamer live page | 2026-11-21T10:10:35Z (page modified 2026-11-19) | "Attack force \| ??? \| Down, Up, Left, Left, Right, Down, Down, Up, Down" |
| 8 inputs | GameSpot, archive capture of 2026-11-18T18:46:39Z | fetched 2026-11-21T10:11:50Z | "Attack Force cheat code: Down, Up, Left, Right, Down, Down, Up, Down." |
| 8 inputs | Fandom rev 2089363 (cites GameSpot) | 2026-11-21T10:07:17Z | "Down, Up, Left, Right, Down, Down, Up, Down" |

Both sides are real captures, on different days. An archive capture of the PC
Gamer page from 2026-11-18T18:50:23Z was fetched (HTTP 200, 396,359 bytes) but
contained no cheat table rows, so whether PC Gamer's row changed between the
18th and the 19th is unknown. Neither guide claims to have tested this code.
The disagreement is recorded as an unresolved conflict; both variants ship as
`conflicting` and are never presented as working codes.

Other disagreements seen and recorded, not modelled as input conflicts:
Max Ammo unlock is "Win 25 bronze medals" on GameSpot/Fandom and "Win 20 bronze
medals" on PC Gamer; GameSpot spells the vehicle "Maibatsu Boomazoon", PC Gamer
and Fandom "Boomazoom"; PC Gamer lists a sequence for "Drunk" that GameSpot's
archive leaves blank.

### Recycled GTA V inputs (gta6cheatcodes.com lead)

https://www.gta6cheatcodes.com/ (checked 10:14:54Z, HTTP 200) says of its own
list: "Unconfirmed means the code is carried over from GTA V and has not been
tested in GTA 6", and of the real system: "entered on the in-game iFruit phone
by holding L1 and R1 and entering a d-pad sequence, not with the button
combinations GTA V used ... We have not independently verified". The lead is
confirmed as stated by the site itself. The site is a research lead only and is
not an eligible source.

### Outcome

**Zero cheats meet the confirmation rules.** No official documentation of any
input was found. Neither eligible guide documents its own test of a specific
input, effect and platform. The two guides are not shown to be independently
originated (both read the same in-game list), neither names a platform, and
GameSpot's live page cannot be re-read to match a binding. The evidence
manifest therefore ships with an empty confirmation set.

## 3. Wiki APIs from the runtime network path

User-Agent sent: `gta6-mcp/0.1 (+https://github.com/ahump20/gta6-mcp)`.

| Request | checked_at | Status / content type | Observed |
| --- | --- | --- | --- |
| `gta.fandom.com/api.php?action=query&list=search&srsearch=GTA+VI+cheats` | 10:06:53Z | 200, `application/json; charset=utf-8` | Valid shape. First hit "Cheats in GTA VI" (pageid 432288), followed by GTA V, IV and other games' cheat pages. **Snippets are empty strings** on this wiki. |
| `…list=allpages&apprefix=Cheats+in+GTA` | 10:06:57Z | 200, JSON | 19 titles, one of them "Cheats in GTA VI". |
| `…list=allpages&apprefix=Easter+Eggs+in+GTA` and `…Secrets+and+Easter+Eggs+in+GTA` and `…Secrets+in+GTA` | 10:06:58Z–10:07:22Z | 200, JSON | 10, 14 and 1 titles. **None is for GTA VI.** |
| `…action=parse&page=Secrets+and+Easter+Eggs+in+GTA+VI` and `…page=Easter+Eggs+in+GTA+VI` | 10:14:57Z | 200, JSON with `error.code = "missingtitle"` | Authoritative absence: no GTA VI Easter egg or secrets page exists on the wiki. |
| `…action=parse&page=Cheats+in+GTA+VI&prop=wikitext\|revid\|sections` | 10:07:17Z | 200, JSON | revid 2089363, wikitext 3,508 bytes, four sections. |
| same with `prop=tocdata` | 10:07:19Z | 200, JSON | `tocdata.sections[]` with `line`, `index`, `anchor`, `hLevel`. |
| same with `&section=99` | 10:07:28Z | 200, JSON with `error.code = "nosuchsection"` | Distinguishes a missing section from a missing page. |
| `…action=parse&page=Cheats+in+GTA+5&redirects=1` | 10:14:56Z | 200, JSON | `redirects: [{from: "Cheats in GTA 5", to: "Cheats in GTA V"}]`. |
| `…action=query&prop=categories&titles=…` | 10:19Z | 200, JSON | "Cheats in GTA VI" → `Cheats; GTA VI`. "Cheats in GTA V" → `…; GTA V`. "State of Leonida" → `Locations in GTA VI; States`. |
| `en.wikipedia.org/w/api.php?action=parse&page=Grand_Theft_Auto_VI&prop=sections\|revid` | 10:07:03Z | 200, JSON | Works, with the warning `"prop=sections" has been deprecated. Please use "prop=tocdata" instead.` |
| same with `prop=tocdata` | 10:10:35Z | 200, JSON | 24 sections. |
| `…action=query&list=search` on Wikipedia | 10:07:05Z | 200, JSON | HTML snippets with `<span class="searchmatch">`. |
| `…meta=siteinfo&siprop=general\|rightsinfo` | 10:07:02Z, 10:07:06Z | 200, JSON | Fandom: MediaWiki 1.43.10, rights "CC-BY-SA", https://www.fandom.com/licensing. Wikipedia: MediaWiki 1.48.0-wmf.5, "Creative Commons Attribution-Share Alike 4.0". |

Decisions taken from these observations:

- **Use `prop=tocdata`** on both wikis. Both support it; Wikipedia marks
  `sections` deprecated.
- **Check API-level errors on HTTP 200.** `missingtitle` and `nosuchsection`
  arrive with status 200.
- **GTA VI applicability comes from page categories** (a category matching
  `GTA VI`) or the page's own text, because Fandom search returns other games'
  pages for GTA VI queries and gives no snippet to judge by.
- **Exclude leak pages.** A title search surfaced "Grand Theft Auto VI/Leaks"
  (category "GTA VI"). Titles containing "leak" are never returned.
- **The cheats page uses plain comma-separated text, not icon templates.** The
  GTA V page uses `[[File:Xbox Left.png|25px|D-Pad Left]]` image links with alt
  text; that observed form drives the icon mapping.
- **Bind reviews to a fingerprint of the reviewed text, not the page revision.**
  Wikipedia's article moved from rev 1386908820 to 1386910091 within twelve
  minutes of this session.
- The Fandom licence string names no version. Fandom's licensing page was not
  read; sources are labelled "CC BY-SA (see https://www.fandom.com/licensing)".

## 4. SDK and toolchain

| Item | Source | Observed |
| --- | --- | --- |
| `@modelcontextprotocol/server@2.4.0` | `npm view` on registry.npmjs.org, and the unpacked tarball | Exists; `latest` is 2.4.0. `engines.node: ">=20"`, `type: module`, dependencies `zod ^4.2.0` and `@modelcontextprotocol/core 2.4.0`. Exports `.` and `./stdio`. |
| `@modelcontextprotocol/client@2.4.0` | same | Exists; `engines.node: ">=20"`. Exports `.` and `./stdio`. |
| stdio serving | `dist/stdio.d.mts` in the server tarball | `serveStdio(factory, options?)`. `legacy?: 'serve' \| 'reject'`, default `'serve'`: one factory serves both eras, and the opening exchange picks the era. |
| Tool registration | `dist/mcp-*.d.mts` | `server.registerTool(name, { title, description, inputSchema, outputSchema, annotations }, cb)` with Standard Schema objects; the raw-shape overload is deprecated. |
| Client negotiation | `dist/client-*.d.mts` in the client tarball | `ClientOptions.versionNegotiation.mode: 'legacy' \| 'auto' \| { pin: string }`. `'legacy'` is the plain 2025 `initialize` sequence. `{ pin }` requires `server/discover` to offer that revision and has no fallback. `client.getNegotiatedProtocolVersion()` and `client.getProtocolEra()` report the result. |
| Installed versions | `package-lock.json` | server 2.4.0, client 2.4.0, core 2.4.0, zod 4.6.7, typescript 7.0.2, vitest 4.1.12, @types/node 20.19.43. |
| Test runner on Node 20 | `npm view vitest` | vitest 5.1.1 (latest) needs Node `^22.12 \|\| ^24 \|\| >=26`. vitest 4.1.12 supports `^20 \|\| ^22 \|\| >=24` and is pinned so the minimum Node can run the suite. |
| npm install crash | local run, npm 11.5.1 | `npm install` failed with `Cannot read properties of null (reading 'edgesOut')` in arborist's peer resolution for this dev tree. `legacy-peer-deps=true` in the repo's `.npmrc` avoids it. Runtime install of the published package is checked separately in `docs/SMOKE.md`. |
| Claude Code | `claude --version` | 2.1.330. |

## 5. X search

One bounded search (`GTA 6 cheat code since:2026-11-19`, max 10 results) was
run through the available X search tool at about 10:20Z. It returned HTTP 402,
"developer account is out of credits". Zero posts were read. X stays outside
runtime and outside confirmation.

## 6. Leads checked by a research pass

These were read by a research subagent of the implementing agent between
10:15Z and 10:23Z, through search and page-reading tools, **not** from the
runtime network path. Quotes are as that pass reported them. None of these
pages was captured as a fixture, and none is used as evidence in the manifest.

| Claim | Source | Published | Observed | Uncertainty |
| --- | --- | --- | --- | --- |
| Take-Two on platforms | https://www.take2games.com/ir/news/rockstar-games-announces-grand-theft-auto-vi-now-available | 2026-11-19 | "is now available for the PlayStation® 5 computer entertainment systems and the Xbox Series X\|S games and entertainment system." | Read in full by the research pass. |
| Take-Two on single-player | https://www.businesswire.com/news/home/20260624539426/en/Rockstar-Games-Announces-Pre-Orders-for-Grand-Theft-Auto-VI | 2026-06-24 | "Grand Theft Auto VI features a single-player experience". | Pre-launch release. The launch release says nothing about single-player or online. |
| Take-Two on GTA Online | https://ir.take2games.com/static-files/a45ff316-72c4-4255-b123-aace2e41ad1a (prepared remarks) | 2026-11-09 | "Rockstar Games will continue to support Grand Theft Auto Online with new content and ongoing events for its vast community." | About the existing GTA Online. No Take-Two statement about a GTA VI online mode was found. |
| "2027" online mode: origin | https://www.bloomberg.com/features/2026-grand-theft-auto-6-making-of/ | 2026-10-14 | "the planned online component, which is expected to be released in 2027". | Byline not seen; other outlets credit Jason Schreier. An earlier item (Bloomberg, 2026-09-17, read only as lede and metadata) is relayed by The Verge as Twitch's CEO saying "an even bigger one next year when they launch multiplayer", which says "next year", not "2027". Earliest found, not proven first. Reporting, not an announcement. |
| PC version: official position | https://support.rockstargames.com/articles/4QfG4FmZCf5W1gS8jy4UVT/grand-theft-auto-vi-platform-editions-and-versions | updated 2026-11-18 | "You can pre-order Grand Theft Auto VI for PlayStation 5 and XBOX Series X\|S." No PC version announced. | Reached through a search tool; the same host timed out from the runtime path (section 1). |
| PC version: Q1 2027 report origin | https://gamesbeat.com/grand-theft-auto-vis-pc-release-is-slated-for-q1-2027/ | 2026-10-13 | "according to four industry sources familiar with the studio's plans". The Verge and Tom's Hardware attribute their reports to GamesBeat. | A report. |
| "61 cheats": where the number comes from | https://www.tweaktown.com/news/114769/gta-6-has-61-cheats-but-youll-have-to-beat-the-story-before-using-any-of-them/index.html | 2026-11-18 | "A new Cheats List menu appears under the Progress menu once the story is complete." Outlets point to the in-game list and a category sum (10+11+21+3+16). None cites Rockstar. | **Reasoned:** every guide reads the same in-game list, so the guides are not independent origins for a code. |
| Inputs still undiscovered | G2A, Vice, Polygon, Gizdev | 2026-11-18 to 11-20 | G2A: "many of their directional sequences remain undiscovered on November 18". Gizdev: "43 codes are still sitting undiscovered". Polygon: "We're still working to hunt down every cheat code". | Site-level statements about the list as a whole, not about any one row. |
| G2A: what it tested | https://www.g2a.com/news/gta-6-news/gta-6-cheat-codes-guide-all-cheats/ | 2026-11-18, labelled sponsored | No first-hand test. Codes are "cross-referenced across the freshest post-embargo guides". | Research lead only. |
| Gizdev: what it tested | https://www.gizdev.com/gta-6-cheat-codes-ps5-xbox/ | 2026-11-20 | No own testing and no platform; codes "confirmed so far, thanks to players who finished the main story". | Research lead only. |
| Eurogamer | https://www.eurogamer.net/all-gta-6-cheats | 2026-11-19 | Attack Force "Down, Up, Left, Left, Right, Down, Down, Up, Down". No personal-test statement. Says "hold both the L1 and R2 buttons". | Date and table came from two different snapshots. Not captured by this build. |
| Polygon | https://www.polygon.com/gta-6-cheat-codes-list-unlock/ | 2026-11-19 | Same 9-input Attack Force. "We have only been able to test the PS5 version of the game so far". | The test statement covers the entry method and the story gate, not a specific code. Not captured by this build. |
| IGN | https://www.ign.com/wikis/gta-6 and guessed URLs | | Could not be read: blocked in three tools, stale hub copy, three 404s. | **Unavailable.** |
| Rockstar Support on cheats | https://support.rockstargames.com/articles/6sa5xpe2WSuHzecJut4tAZ/issues-after-using-cheat-codes | last updated 2024-01-09 | Generic, pre-dates GTA VI: "Unless the code was given in-game, or in the manual then the code is unofficial and cannot be supported." No GTA VI cheats article found. | Not about GTA VI. |

What this changes: three eligible guides (PC Gamer captured; Eurogamer and
Polygon as reported) list the 9-input Attack Force sequence, against GameSpot's
8-input sequence in its 18 November archive. That makes a GameSpot typo
likely. **It does not resolve the conflict**: resolution needs official
documentation or two independent direct verifications, and no source claims to
have entered this code. Both variants stay `conflicting`.

Two more entry-method disagreements are now on record: PC Gamer "hold L1 and
press R1", GameSpot "holding L1 + R1", Eurogamer "hold both the L1 and R2
buttons". The server reports the wiki's wording as source-reported and does
not pick one.


## 7. gta.wiki (Weird Gloop): probed, then ruled out

Probes ran from 2026-11-21T10:40:46Z to about 10:41:30Z from the server's network path with the server's User-Agent, using a development probe script that is not shipped.

| Request | Result |
|---|---|
| `https://gta.wiki/` | HTML page. The main page says the GTA Wiki "has officially migrated from Fandom". Footer licence: CC BY-NC-SA 3.0. |
| `https://gta.wiki/robots.txt` | Text file. Line 249, in the `User-Agent: *` group: `Disallow: /*api.php`. |
| The site's RSD document | Names the API endpoint: `https://gta.wiki/api.php`. |
| `api.php?action=query&meta=siteinfo` | Valid JSON API response. Site name "GTA Wiki", MediaWiki 1.45.3, rights "CC BY-NC-SA 3.0" (https://creativecommons.org/licenses/by-nc-sa/3.0/). |
| `list=search` (two queries: cheats, Easter eggs) | Valid JSON API responses, 10 hits each. "Cheats in GTA VI" is the second hit for the cheats query. |
| `list=allpages` (prefixes Cheats, Easter, Secrets) | Valid JSON API responses. Titles include "Easter Eggs in GTA VI". |
| `action=parse` | Never requested. |

Those API requests were made before the terms were read. No request has been made to gta.wiki since.

Policy, read from the same captures:

- Weird Gloop Terms of Use, https://weirdgloop.org/terms/, "Updated on 31 January 2025". Among activities "we also do not allow": "Attempting to use our Sites in an automated fashion without prior consent from the Company, or other users on our platform where applicable".
- https://gta.wiki/w/GTA_Wiki:Policy and https://meta.weirdgloop.org/w/Category:Global_policies were read. Neither contains an API or bot policy that grants automated access.
- Licence: https://meta.weirdgloop.org/w/Licensing says text on most Weird Gloop wikis is CC BY-NC-SA 3.0.

Decision: gta.wiki is not permitted for this server without Weird Gloop's prior consent. The robots rule was recorded but not relied on, since a crawler rule does not settle API permission. The server makes no request to gta.wiki. `gtawiki` remains a recognised `get_page` source and returns `upstream_unavailable` with a `coverage_gap` notice. Consent can be requested from Weird Gloop (support@weirdgloop.org, or the wiki's contact page).

Coverage note: gta.wiki has both a GTA VI cheats page and a GTA VI Easter eggs page. The Fandom copy has no GTA VI Easter egg page (section 3).

## 8. Fandom: automated access needs written permission

Read first-hand by the reviewer in a browser:

- https://www.fandom.com/terms-of-use, read 2026-11-21T11:06:40Z. "Date of Last Revision: December 19, 2025".
  - Scope: "These Terms of Use apply to our websites at fandom.com, wikia.org and muthead.com, and their respective subdomains".
  - "Use any robot, spider, site search and/or retrieval application, or other device to scrape, extract, retrieve or index any portion of the content;" (in a list of things a user may not do).
  - "not use any robot, spider, scraper or other automated means to access the Services for any purpose without our express written permission;"
- https://community.fandom.com/wiki/Help:API, read about 2026-11-21T10:58Z: "There is currently no text in this page."
- https://community.fandom.com/wiki/Help:Bots, read 2026-11-21T11:06:53Z: "A bot is a program or script that automatically edits wiki pages." and "Bots on Fandom must use a limited editing rate so that they don't overload Fandom's servers." It refers readers to MediaWiki.org for API clients. It says nothing about read-only retrieval.
- https://www.fandom.com/licensing, read 2026-11-21T11:13:22Z: "Except where otherwise permitted, the text on Fandom communities (known as "wikis") is licensed under the Creative Commons Attribution-Share Alike License 3.0 (Unported) (CC BY-SA)." and "Some wikis use licenses other than the CC BY-SA license." The GTA Wiki's own rights record (`meta=siteinfo`, captured about 2026-11-21T10:45Z) reads "CC-BY-SA" and links that page. MediaWiki 1.43.10.

From the server's network path (2026-11-21T10:44Z to 10:45Z), `www.fandom.com/terms-of-use`, `www.fandom.com/licensing` and `gta.fandom.com/robots.txt` each returned an HTTP 403 challenge page, while `gta.fandom.com/api.php` returned HTTP 200 JSON.

The sources pull in different directions and this record does not pretend otherwise: Fandom's help pages describe sanctioned bots that use the API, and the API answers; the Terms of Use bar automated access without express written permission, and no published page grants it for read-only use. The brief says to follow each host's published policy, so the stricter text governs.

Decision: the Fandom provider is off by default. Every Fandom request is refused before any network call unless the operator sets `GTA6_MCP_FANDOM_PERMISSION=granted`, which records that Fandom gave written permission. The setting is not set in the smoke run, in CI, in the Claude Code proof or in the installed configuration, because nobody holds that permission today.

What already happened: the Phase 0 probes and the test fixtures in section 3 were fetched from `gta.fandom.com/api.php` on 2026-11-21 before these terms were read. No Fandom API request has been made by this project since the reviewer read the terms.

Both GTA Wiki hosts are therefore closed to this server by their terms. Within the approved source policy the remaining runtime provider is Wikipedia.

## 9. Wikipedia: permitted

- https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy (captured 2026-11-21T10:44Z): "Scripts should use an informative User-Agent string with contact information, or they may be blocked without notice." and "If you operate a bot, please send a User-Agent header identifying the bot in a way that isn't going to be confused with many other bots, and supplying some way of contacting you, the operator, in accordance with the API Usage Guidelines."
- https://www.mediawiki.org/wiki/API:Etiquette was read for request pacing.
- The server sends `gta6-mcp/0.1 (+https://github.com/ahump20/gta6-mcp)`, makes requests one at a time per host with spacing, caches responses and honours `Retry-After`.
- Licence: CC BY-SA 4.0.

## 10. Guide and official hosts: robots and terms

Captured by a helper agent from the server's network path on 2026-11-21 between 10:47Z and 10:58Z; the full notes with quotes are in `docs/research/hosts.md`. The reviewer read the summary and the Fandom section, not every quote.

| Host | robots.txt for the exact URL | Terms |
|---|---|---|
| www.pcgamer.com | No rule matches | Future's terms bar robots, spiders, crawlers and scrapers, and say robots.txt is never written permission |
| www.gamespot.com | `Allow: /` | No current GameSpot terms page could be read; the footer names Fandom, Inc. |
| www.ign.com, www.eurogamer.net | No rule matches for an unnamed agent; about 175 named AI agents are blocked; the file's comments prohibit automated retrieval without written permission | Ziff Davis terms prohibit it |
| www.polygon.com | No rule matches for an unnamed agent; the file's comments prohibit automated retrieval without written permission | Valnet terms prohibit crawling and scraping |
| www.rockstargames.com | No `*` group; eight named bots are disallowed | Terms bar bots that collect information and use for generative AI tools. Two readers returned different revision dates for the same URL; both are recorded |
| support.rockstargames.com | Timed out twice; no verdict | Not read |
| www.take2games.com | No rule matches | Same generative-AI clause as Rockstar |
| www.playstation.com | No rule matches; `Crawl-delay: 5` | Read; see the notes |
| www.xbox.com | No rule matches | Microsoft Terms of Use read; see the notes |

Outcome: no guide host's terms allow this server to re-read a guide page. Under the brief, any evidence on those hosts is offline-reviewed only and carries `runtime_recheck: "not_permitted"`, and a claim that rests on it stays `unverified` at run time. The manifest has zero confirmations, so the server fetches no guide or official URL today.

## 11. Community sources

What could be read on 2026-11-21:

| Platform | Result |
|---|---|
| Reddit, owner-supplied thread `https://www.reddit.com/r/GTA6unmoderated/s/3ZJFtKSupf` | Not read. The browser extension refused to open reddit.com ("This site is not allowed due to safety restrictions."). No other route was tried, since that would be working around a block. |
| TikTok search | Not read. A login wall covered the results ("Log in to search for popular content"). |
| X | Not read. The search tool returned HTTP 402, out of credits. |
| YouTube | 22 leads captured by a helper agent through a third-party YouTube data plugin. How that plugin obtains its data was not checked against YouTube's API terms. Its notes are in `docs/research/community-leads-youtube-x.md`. |

The reviewer then opened five watch pages in a browser at 2026-11-21T11:10Z and read each page's own metadata (title, channel, upload time, description). Frames were not inspected for any video.

| Video | Channel | Upload time on the page | UTC | Decision |
|---|---|---|---|---|
| https://www.youtube.com/watch?v=Hj23ZNatmZQ | @JOETHzz | 2026-11-18T19:00:22-08:00 | 2026-11-19T03:00:22Z | Registered. The description lists a nine-step D-pad sequence for Attack Force, the same as the PC Gamer variant. No test is claimed. |
| https://www.youtube.com/watch?v=Mj_beVHUJE4 | @MrDalekJD | 2026-11-18T19:50:41-08:00 | 2026-11-19T03:50:41Z | Registered as an unverified Easter egg report, shown from `discovery` up because its description names a location. |
| https://www.youtube.com/watch?v=C7wrTvoDnww | @GoldxLeaf | 2026-11-18T17:55:55-08:00 | 2026-11-19T01:55:55Z | Not registered. A general guide whose description says it is captured footage with no commentary; it makes no single claim to register. A candidate for frame inspection. |
| https://www.youtube.com/watch?v=c-UFvg-X8O0 | @JackedBillGaming | 2026-11-18T17:54:32-08:00 | 2026-11-19T01:54:32Z | Not registered. Its description calls the codes "reported". |
| https://www.youtube.com/watch?v=a78-WeEiTRs | @dpjsc08 | 2026-11-18T15:19:24-08:00 | 2026-11-18T23:19:24Z | Excluded by the date rule, applied in UTC: it was posted 41 minutes before 2026-11-19. Its description is the only one that says the uploader demonstrates the codes. |

No video-backed approval exists. No pair of videos was frame-inspected, so whether a pair exists that would meet the video rule is unknown, not ruled out.

Platform API terms (helper agent, 2026-11-21T10:46:59Z to 10:54:11Z; full notes with quotes in `docs/research/platform-api-terms.md`): Reddit, X, YouTube and TikTok each require an account and an app credential for programmatic search or read access, and each one's terms prohibit unauthenticated automated access. X bills per post read. TikTok's keyword search is limited to approved research applicants. Two Reddit help pages could not be fetched directly and are marked unverified in the notes. A no-account runtime provider is therefore not possible on any of the four, which is why social platforms stay outside runtime retrieval.

## 12. Hand-over and differences from the brief

Two Claude Code sessions worked on this release. The first, on an earlier version of the brief, produced sections 1 to 6, the schemas, the network client, the wikitext parser, the Fandom and Wikipedia client, the evidence manifest and the four tool handlers. It was stopped on the owner's instruction, and the second session adopted its branch and finished the release on the revised brief.

| The brief expected | Observed | What the release does |
|---|---|---|
| gta.wiki as the primary gameplay provider | Its host requires prior consent for automated use (section 7) | Never requested. `gtawiki` stays in the `get_page` contract and says why it returns nothing. |
| Fandom as a labelled secondary | Its terms require express written permission (section 8) | Built, tested, off by default behind a recorded-permission setting. |
| A wiki to supply gameplay text at run time | Neither GTA Wiki host is open | Out of the box the server reads Wikipedia, its recorded conflict and its reviewed community reports. |
| Community posts from 2026-11-19 onward | Upload times carry a zone offset | The cutoff is applied in UTC and each time is stored in UTC. |
| A re-checkable binding for confirming evidence | No guide host permits automated re-reading (section 10) | Such evidence would be offline-reviewed only and its claims stay unverified, as the brief directs. |
