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

Retried once later on 2026-11-21 for v0.1.1: the same HTTP 402, while the
tool's own usage report showed nothing spent that day. Zero posts read. The
account needs credits added by its owner before X can be read.

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

The reviewer then opened five watch pages in a browser at 2026-11-21T11:10Z and read each page's own metadata (title, channel, upload time and the start of the description), and at 11:36Z read the two registered videos' descriptions in full. Frames were not inspected for any video in v0.1.0. They were for v0.1.1; section 16 has the result.

| Video | Channel | Upload time on the page | UTC | Decision |
|---|---|---|---|---|
| https://www.youtube.com/watch?v=Hj23ZNatmZQ | @JOETHzz | 2026-11-18T19:00:22-08:00 | 2026-11-19T03:00:22Z | Registered. The description lists a nine-step D-pad sequence for Attack Force, the same as the PC Gamer variant. The description mentions no test; what the footage shows was not checked. |
| https://www.youtube.com/watch?v=Mj_beVHUJE4 | @MrDalekJD | 2026-11-18T19:50:41-08:00 | 2026-11-19T03:50:41Z | Registered as an unverified Easter egg report, shown from `discovery` up because it names a location. The title claims an Easter egg with a secret cutscene; the description says the video is about the climb and the view, and only that "reports mention a bird nest easter egg nearby". A weak lead, labelled as one. |
| https://www.youtube.com/watch?v=C7wrTvoDnww | @GoldxLeaf | 2026-11-18T17:55:55-08:00 | 2026-11-19T01:55:55Z | Not registered. A general guide whose description says it is captured footage with no commentary; it makes no single claim to register. A candidate for frame inspection. |
| https://www.youtube.com/watch?v=c-UFvg-X8O0 | @JackedBillGaming | 2026-11-18T17:54:32-08:00 | 2026-11-19T01:54:32Z | Not registered. Its description calls the codes "reported". |
| https://www.youtube.com/watch?v=a78-WeEiTRs | @dpjsc08 | 2026-11-18T15:19:24-08:00 | 2026-11-18T23:19:24Z | Excluded by the date rule, applied in UTC: it was posted 41 minutes before 2026-11-19. Its description is the only one that says the uploader demonstrates the codes. |

No video-backed approval exists. No pair of videos was frame-inspected, so whether a pair exists that would meet the video rule is unknown, not ruled out. (State at v0.1.0. Section 16 replaces "unknown" with a checked result.)

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

## 13. Install routes, tested before the tag

Tested on 2026-11-21 against the pull request's head commit, each from an empty npm cache.

| Route | Node 20.20.2, npm 10.8.2 | Node 24.5.0, npm 11.18.0 |
|---|---|---|
| `npx -y <tarball URL>` (the packed release file, served over HTTP locally) | Starts in about 2 seconds cold. The live protocol test passes through it on both eras. | Not run. |
| `npx -y github:ahump20/gta6-mcp#<commit>` (builds on install) | Fails: "GitFetcher requires an Arborist constructor to pack a tarball". | Starts in about 9 seconds cold and about 7 on later starts. |

The README therefore leads with the release file. The same two routes are tested again against the published release.

## 14. Review findings left open in v0.1.0

Section 17 gives the state of each of these in v0.1.1.

Two automated reviewers read the pull request. The findings that touched evidence rulings, spoiler clearance, data strictness and crashes were fixed with tests. These were read and left for a later version:

- A wiki error returned with HTTP 200 is cached like a success, so a short wiki read-only window can replace a good cached copy for the cache's lifetime. This affects availability, not correctness.
- Cache entries are not separated by response type; an invalid redirect target has no typed failure; `Retry-After` given as a date is not honoured; unread response bodies are not released early.
- A page that qualifies only by its category is not accepted by `get_page`; only the first batch of categories is read.
- Whitespace normalisation for fingerprints covers ASCII whitespace only. Mixed video and guide evidence has no stated binding rule. A resolution cannot rest on a video pair.
- The wire recorder used by the live test can split a multi-byte character across chunks and can miss a final unterminated line.

## 15. The published release, verified

Run on 2026-11-21 after the release was created. The Fandom permission setting was not set in any run.

| Item | Result |
|---|---|
| Release | https://github.com/ahump20/gta6-mcp/releases/tag/v0.1.0 |
| Shipped commit | `3e3b0d1776c92cba07be0a14b4386c103e89954e` (merge of pull request 1), tagged `v0.1.0` |
| CI | Pass on Node 20 and 22 for the pull request head, for `main` at the shipped commit, and in the release run |
| Tarball | `gta6-mcp-0.1.0.tgz`, SHA-256 `9811c6fe105b469461e9f2569e309206ad6e3f3701135fd78ebe547e2bc757a9`. A fresh download matched the published checksum. |
| `npx -y <release tarball URL>` | Node 20.20.2, npm 10.8.2, empty cache: live protocol test passed on both eras (`2025-11-25` and `2026-07-28`) |
| `npx -y github:ahump20/gta6-mcp#v0.1.0` | Node 20.20.2, npm 10.8.2, empty cache: live protocol test passed on both eras. Node 24.5.0, npm 11.18.0: started cleanly. |
| Claude Code headless call | Claude Code 2.1.330, isolated configuration with `--strict-mcp-config`, only the four tools allowed: the server connected, the four tools were listed, and `list_cheats`, `easter_eggs` and `get_page` each returned a labelled result |
| Claude Code install | Local scope in the `gta6-mcp` checkout, release tarball command. `claude mcp get gta6` reported it connected, and a `list_cheats` call from that folder returned 3 reports and 0 confirmed cheats |

Correction to section 13: that test used a full commit hash as the address. With the tag, the build-on-install route works on npm 10 as well. The failure is specific to a commit-hash address on npm 10.

The filtered record of these runs is attached to the release as `gta6-mcp-0.1.0-verification.json`, with the wire logs beside it.

## 16. Video frames, inspected (v0.1.1)

Reviewer: Claude Fable 5.2 (AI agent, Anthropic), main Claude Code session. 2026-11-21, 11:55Z to 12:46Z. Each watch page was opened in a browser, playback was muted and paused, the player was moved to chosen times, and the still frame was read from a screenshot, zoomed where arrows had to be counted. Frames were sampled; no video was watched end to end. No gameplay test was performed.

| Video | Channel, length | What the frames show | Meets the video rule |
|---|---|---|---|
| https://www.youtube.com/watch?v=C7wrTvoDnww | @GoldxLeaf, 112 s | One character standing idle in a driveway for the whole video. Captions added in editing give a cheat name, an unlock line and a row of arrows, 18 in all; every caption was read. No phone, no code entry, no effect. The cash figure in the corner never changes. | No |
| https://www.youtube.com/watch?v=Hj23ZNatmZQ | @JOETHzz, 253 s | Sampled from 1:00 to 3:35: the in-game phone held open, an inset camera on a DualSense controller, an on-screen list of steps and a web page table of codes. The cash figure is identical at 1:28, 1:52 and 1:56. No sequence is entered on the game's interface and no effect appears. | No |
| https://www.youtube.com/watch?v=Peo_d4Oh-x0 | @FrameproofGaming, 360 s, uploaded 2026-11-19T00:32:41-08:00 (08:32:41Z) | Sampled from 0:30 to 5:30: an edited explainer with gameplay clips behind designed cards. The card at 2:55 sets Exploding Balls beside Attack Force and says the ninth input is the only difference. Several cards read "Input pending". The title says the codes were tested; no frame sampled shows one entered. | No |
| https://www.youtube.com/watch?v=Mj_beVHUJE4 | @MrDalekJD, 482 s | Gameplay of a climb up a red radio tower. Near 5:22 a striped egg is shown in mid-air above the map; from 5:37 to 5:46 a character stands beside a nest on the top platform. Consistent with the title. | Not a cheat. One video, so the report stays unverified. |
| https://www.youtube.com/watch?v=a78-WeEiTRs | @dpjsc08, 373 s | Sampled at 0:10, 1:02, 1:18, 1:29 to 1:37, 2:02, 3:35, 5:00 and 5:55: an opening clip, then designed cards over blurred footage, one per code, and a card of entry steps. No code entry and no effect. | No |

The last video is the one section 11 excluded by the date rule. It was inspected only to learn whether that exclusion hid a demonstration. It did not, and the video stays unregistered.

Outcome:

- **No video meets the video rule, so there is no video-backed confirmation.** Section 11 called this unknown. It is now checked in five videos, by sampling: a demonstration shorter than the gaps between samples could have been missed in the three longer cheat videos.
- **Registered as text claims**: the 18 captions in the @GoldxLeaf video, and the Attack Force card in the @FrameproofGaming video. Each has no platform and no effect, because the frames show neither. Unlock lines were left out. The two v0.1.0 entries now say what their frames show. No entry carries a video review record: such a record marks a video as usable evidence, and none of these is.
- **Reading check**: the 18 caption sequences were compared with the wiki capture of 2026-11-21 (revision 2089363). Sixteen are identical. Attack Force differs (the caption has nine inputs, the wiki eight; section 2). Vehicle Force cannot be compared, because the wiki row uses a template this server cannot resolve. The first reading of the Body Armor caption counted four Ups where the frame has five; the comparison caught it, and the entry was corrected from a zoomed frame.
- **Agreement is not confirmation.** Where these lists agree, their lineage is unknown and a shared source is likely (reasoned). Three videos and PC Gamer print the nine-input Attack Force; none shows it entered. The dispute stays unresolved.
- **Not inspected**: the @JackedBillGaming video in section 11 and the other leads in `docs/research/community-leads-youtube-x.md`.

Community platforms, tried again at about 12:48Z: the browser extension still refuses reddit.com ("This site is not allowed due to safety restrictions."), and TikTok search still shows "Log in to search for popular content". Neither was worked around. X is in section 5. Reading the owner-supplied Reddit thread needs its text pasted in by the owner.

## 17. Review findings from section 14: state in v0.1.1

| Finding | State |
|---|---|
| A wiki error returned with HTTP 200 is cached like a success | Fixed. Such a response is a failure, is never cached, and an expired good copy is served instead, labelled stale. A missing page is still an answer, not a failure. |
| Cache entries are not separated by response type | Fixed. |
| An invalid redirect target has no typed failure | Fixed. |
| `Retry-After` given as a date is not honoured | Fixed, capped at five seconds. |
| Unread response bodies are not released early | Fixed. |
| A page that qualifies only by its category is not accepted by `get_page` | Fixed. Spoiler clearance still applies afterwards. If the categories cannot be read, the tool says the wiki was unreachable instead of calling the page out of scope. |
| Only the first batch of categories is read | Fixed, up to five batches; a list still unfinished after five is treated as unread, not as complete. The continuation format follows the MediaWiki documentation; no real continued response was captured, since Fandom is not requested. |
| Whitespace normalisation covers ASCII only | Fixed and renamed `collapse-unicode-whitespace-v2`. Every recorded fingerprint still matches: the 18 reviewed rows and the entry steps are returned from the real capture as before. |
| Mixed video and guide evidence has no binding rule | Ruled: it is not video-backed. Re-readable items must match; one item that cannot be re-read keeps the claim unverified. |
| A resolution cannot rest on a video pair | Fixed. Two frame-inspected videos that share no URL, origin or account can settle a dispute; anything less is rejected. |
| The wire recorder can split a multi-byte character and miss a final line | Fixed. It also no longer waits forever when a process its child started keeps the output open. |

The automated reviewers read the v0.1.1 pull request as well. One found four things, all fixed before the tag, each with a test:

- Three videos could pass as "two independent" while every pair of them shared a URL, an origin or an account. The rule now needs one pair that shares none.
- A category list cut off at the five-batch bound was reported as complete.
- Categories served from an expired cache entry carried no stale notice.
- The recorder's new exit path could drop a last line that had no newline.

Still open:

- `easter_eggs` decides whether a wiki page is about GTA VI from its title and text only, not its categories. Both page titles it reads name the game, so nothing is missed today.
- With the category check, one search can make up to five category requests.

## 18. v0.1.1 release file, tested before the tag

Run on 2026-11-21 at 13:01Z against commit `96a1539`, the last commit that changes anything inside the package. An earlier run at 12:51Z, before the review fixes in section 17, passed the same way. The Fandom permission setting was not set.

| Item | Result |
|---|---|
| Checks | Typecheck clean, 299 tests pass, evidence and fixture checks pass, on Node 20.20.2 |
| Release file | Packed with `npm pack`, as the release workflow does: 15 files, version 0.1.1, 21 community entries in its data |
| `npx -y <tarball URL>`, served over HTTP locally | Node 20.20.2, npm 10.8.2, empty npm cache: the live protocol test passed on both protocol versions (`2025-11-25` and `2026-07-28`). The server reported version 0.1.1 and shut down cleanly both times. The whole run took 13 seconds. |
| What a player gets from that file | `list_cheats` with reports included: 22 rows, 0 confirmed. `easter_eggs` at `discovery`: 1 report. Wikipedia pages read normally. Fandom not requested. |
| Built server, run directly | The same test, recorded in `docs/smoke/local-node20.json` |

The checksum of the published file and the test of the published release are added after the release exists, since a tagged file cannot describe its own release.

## 19. The published v0.1.1 release, verified

Run on 2026-11-21 between 13:02Z and 13:08Z, after the release was created. The Fandom permission setting was not set in any run. v0.1.0, its tag and its four files were left as they were.

| Item | Result |
|---|---|
| Release | https://github.com/ahump20/gta6-mcp/releases/tag/v0.1.1 |
| Shipped commit | `f06050381cc6aa42422a6adf70802130103f6c6c` (merge of pull request 3), tagged `v0.1.1`. Its tree is identical to the pull request head, and differs from the commit tested in section 18 only in two files under `docs/`, which are not in the package. |
| CI | Pass on Node 20 and 22 for the pull request head, and in the release run |
| Tarball | `gta6-mcp-0.1.1.tgz`, SHA-256 `1df2676f8ad136a9fa4dd2a45985b448c2d30ea722e5ebe494017cdd911279e0`. A fresh download matched the published checksum, which is also the checksum of the file packed before the tag. |
| `npx -y <release tarball URL>` | Node 20.20.2, npm 10.8.2, empty cache: live protocol test passed on both protocol versions (`2025-11-25` and `2026-07-28`); the server reported 0.1.1 |
| `npx -y github:ahump20/gta6-mcp#v0.1.1` | Node 20.20.2, npm 10.8.2, empty cache: live protocol test passed on both protocol versions |
| Claude Code install | Claude Code 2.1.330, local scope in the `gta6-mcp` checkout: the v0.1.0 entry was removed and the v0.1.1 release tarball command added. `claude mcp get gta6` reported it connected. A `list_cheats` call from that folder with reports included returned 22 rows (17 unverified, 5 conflicting) and 0 confirmed. |

The filtered record of these runs is attached to the release as `gta6-mcp-0.1.1-verification.json`, with the wire logs beside it.


## 20. Codex, tested (v0.1.1)

Reviewer: Claude Fable 5.2 (AI agent, Anthropic), Claude Code session. 2026-11-21, 19:36Z to 19:47Z. Every run was a one-shot `codex exec` in a read-only sandbox with the user's own configuration ignored and the server set on the command line (`-c mcp_servers.gta6.*`). The server is the published v0.1.1 release file, unchanged.

| Item | Result |
|---|---|
| Client | Codex CLI 0.166.0 on macOS, Node 24.5.0, npm 11.18.0 |
| Handshake | Recorded through `scripts/tee.mjs`. Codex sent `initialize` as `codex-mcp-client` with protocol version `2025-06-18`. The server answered with the same version, and `tools/list` returned the four tools. |
| Tool call | `list_cheats` with `include_unverified: true` returned status `partial` and 22 rows (17 unverified, 5 conflicting), 0 confirmed. These are the counts of the Claude Code call in section 19. |
| Time to the `initialize` reply | Release file through `npx`: 10.9 s with an empty cache, 4.6 s cached. Tagged source through `npx`: 21.6 s empty, 5.4 s cached. Installed with `npm install -g`: 0.1 s. |
| `npx`, default settings | Failed in 3 runs of 3: Codex answered that it had no gta6 tools. In the recorded run the tool list arrived 7.7 s after the server was started and the session ended 1.6 s later, with Codex reporting no gta6 tools. OpenAI's MCP page says an optional server gets `mcp_optional_startup_grace_ms`, 1000 ms by default, before the first tool list is built. |
| `npx` with `required = true` and `startup_timeout_sec = 60` | Empty cache: the tool was called. Pass. |
| Installed with `npm install -g <release file>`, command `gta6-mcp` | Optional server, default settings: the tool was called. Pass. |
| `codex mcp add gta6 -- gta6-mcp` | Run in a throwaway `CODEX_HOME`. It wrote `[mcp_servers.gta6]` with `command = "gta6-mcp"`, and with `--env` it wrote the `env` table. `codex mcp add` has no flag for `required` or for the timeout. |
| Startup timeout default | Sources disagree. OpenAI's MCP page says 10 seconds. `codex-rs/codex-mcp/src/rmcp_client.rs` on the main branch of `openai/codex` says 30. Not settled for 0.166.0, so the README sets the value. |
| Not tested | The ChatGPT desktop app and the IDE extension. OpenAI's MCP page says they share `~/.codex/config.toml` with the CLI. A longer interactive session, where a slow server may become available after the first answer, was not tested either. |

Source for the Codex settings: https://developers.openai.com/codex/mcp, read 2026-11-21.


## 21. Easter egg listings and default calls (v0.1.2)

Reviewer: Claude Fable 5.2 (AI agent, Anthropic), Claude Code session. 2026-11-22, 00:00Z to 00:55Z.

The v0.1.1 release file was downloaded fresh, its checksum matched, and it was installed into an empty folder and asked for everything it had. It returned 22 cheat reports and one Easter egg. That was compared with what was published the same day (2026-11-21 in the United States).

| Item | Result |
|---|---|
| Cheat codes | The server's 18 code names and their inputs match the RareThief table and the Red Bull table input for input: no name missing on either side, no input different. Attack Force keeps its second, 8-input variant on record. |
| How many codes are known | Sources disagree. Tracker.gg and one video say 17, a social post says 16, and the two tables above give 18 between them: RareThief's table has no Cycle Weather row, and Tracker.gg shows Raise Wanted Level as not yet known. The server returns 18. |
| Attack Force dispute | Still open. GameSpot's page, read through a third-party page reader on 2026-11-21, was reported to print 8 inputs; a direct request still returned HTTP 403, so the recorded reason is unchanged. Every other listing read that day prints 9. |
| Easter eggs | The server had 1; published lists had dozens. This was the gap. |
| Listings read | Polygon (8 entries), gta6bugs.com (more than 50 it calls verified and a handful it calls reported), DuvalWire (about 19) and MetaForge (11). The first three were downloaded and searched by script. MetaForge refused a direct download (HTTP 403), so its headings were read through a page reader. IGN's list could not be read by either route, and the GTAForums thread refused a direct download. |
| Rule for entry | An Easter egg entered the registry only if a script found it in at least two of the four listings, and found its quoted heading word for word in the listing it links to. 18 passed in v0.1.2; one of them should not have, see section 23. |
| Left out | Entries only one listing carries (among them Weird Al, Jeremy Irons, Kodak Black, the Red Hulk, the meteorite and Niko Bellic), the Vercetti Estate, which two listings describe differently, and the Mount Chiliad talk and the Wade podcast, whose second sighting was a forum thread rather than one of the four listings. Videos titled as lists of 30 secrets were not frame-reviewed. |
| What an entry says | A title and a description in the reviewer's words, a place where the listings give one, the listings by name, and that this project has not seen it in the game. Status `unverified`, level `discovery`. Where listings disagree, the entry says so: the colour of the Eclipse, the road of the UFO, and what the Belville house refers to. |
| Default calls | In v0.1.1 a plain `list_cheats` call answered that nothing was returned, and a plain `easter_eggs` call answered only that content was withheld. Neither told an assistant what to ask for. Both now give the count on record and the argument that shows it. |
| Not done | Effects and unlock conditions for cheats, and the 43 cheats that guides name without a code. Unlock conditions need a spoiler review each. No entry was checked in the game. |


## 22. The published v0.1.2 release, verified

Reviewer: Claude Fable 5.2 (AI agent, Anthropic), Claude Code session. 2026-11-22, 01:00Z to 01:20Z.

| Item | Result |
|---|---|
| Release | https://github.com/ahump20/gta6-mcp/releases/tag/v0.1.2 |
| Shipped commit | `70746e5` (merge of pull request 6), tagged `v0.1.2` |
| CI | Pass on Node 20 and 22 for the pull request head, and in the release run. An automated reviewer raised three points on the pull request (the count ignored the caller's platform, the message named `discovery` for entries that need `full`, and a held registry entry could be reported as a wiki outage); all three were fixed before the tag, with tests. |
| Tarball | `gta6-mcp-0.1.2.tgz`, SHA-256 `2a7f5d88dab6c39ec6a30fd835fb54255450f4b17d9f437f524a50876b1761b8`. A fresh download matched the published checksum. |
| Fresh install, hand-written client | Installed into an empty folder under Node 24.5.0. `list_cheats` with `include_unverified: true` returned 22 rows and 18 names, which match the two published tables of section 21 input for input. `easter_eggs` at `full` returned 19. The two default calls returned no rows and the new counts. |
| `npx -y <release tarball URL>` | Node 20.20.2, npm 10.8.2, empty cache: live protocol test passed on both protocol versions (`2025-11-25` and `2026-07-28`); the server reported 0.1.2 |
| `npx -y github:ahump20/gta6-mcp#v0.1.2` | Node 20.20.2, npm 10.8.2, empty cache: live protocol test passed on both protocol versions |
| Claude Code, plain question | Claude Code headless on the v0.1.2 build before the tag, asked what cheat codes and Easter eggs have been reported. It called `easter_eggs` with no arguments, read the count, called again with `spoilers: "discovery"`, and answered with 18 code names and 19 Easter eggs. After the release the local entry was moved to the v0.1.2 tarball and `claude mcp get gta6` reported it connected. |
| Codex, plain question | Codex CLI 0.166.0 with the user's own settings and the release installed by `npm install -g`. It called `list_cheats` with `include_unverified: true`, `easter_eggs` at `hints`, then `easter_eggs` at `discovery`, and ended with 18 code names and 19 Easter eggs. |
| Not tested | Codex through `npx` on v0.1.2, the ChatGPT desktop app, the IDE extension, Windows and Linux desktops (CI runs on Linux). No entry was checked in the game. |

The filtered record of the two `npx` runs is attached to the release as `gta6-mcp-0.1.2-verification.json`, with the wire logs beside it.


## 23. Correction: one Easter egg removed (v0.1.3)

Reviewer: Claude Fable 5.2 (AI agent, Anthropic), Claude Code session. 2026-11-22, 01:25Z to 01:45Z.

v0.1.2 shipped an entry for the "before GTA 6" meme that said DuvalWire listed it. It does not. The script that checked second listings searched the whole downloaded page, scripts included, and the four matches for that phrase were all inside script code, not text a reader sees. The second sighting had been a forum thread, which is not one of the four listings.

The check now ignores script and style blocks. Run again over visible text only, it passed the other 17 entries and failed that one, so the entry was removed. The text around each DuvalWire match for the 17 was also read by the reviewer. v0.1.3 returns 17 guide-listed Easter eggs and the one community report, 18 in all. Release files are never overwritten, so v0.1.2 keeps the wrong entry; the README points at v0.1.3.


## 24. The published v0.1.3 release, verified

Reviewer: Claude Fable 5.2 (AI agent, Anthropic), Claude Code session. 2026-11-22, 01:45Z to 02:10Z.

| Item | Result |
|---|---|
| Release | https://github.com/ahump20/gta6-mcp/releases/tag/v0.1.3 |
| CI | Pass on Node 20 and 22 for the shipped commit, and in the release run |
| Tarball | `gta6-mcp-0.1.3.tgz`, SHA-256 `21dfeda594294a1ec5f68d7bbbe72a89793190c47ec529e69c1d8d82df8928ec`. A fresh download matched the published checksum. |
| Fresh install, hand-written client | Empty folder, Node 24.5.0. 22 cheat rows and 18 names, matching the two published tables of section 21 input for input. 18 Easter eggs at `full`: 17 from the registry and 1 community report. The removed entry is absent. Default calls return no rows and the counts 22 and 18. |
| `npx -y <release tarball URL>` | Node 20.20.2, npm 10.8.2, empty cache: live protocol test passed on both protocol versions; the server reported 0.1.3 |
| `npx -y github:ahump20/gta6-mcp#v0.1.3` | Node 20.20.2, npm 10.8.2, empty cache: live protocol test passed on both protocol versions |
| Claude Code | The local entry was moved to the v0.1.3 tarball; `claude mcp get gta6` reported it connected. The plain-question run of section 22 was not repeated on v0.1.3. |
| Codex, plain question | Codex CLI 0.166.0, the user's own settings, v0.1.3 installed by `npm install -g`. It called both tools at `hints`, then both at `discovery`, and ended with 18 code names and 18 Easter eggs. |
| Not tested | Codex through `npx` on v0.1.3, the ChatGPT desktop app, the IDE extension. No entry was checked in the game. |

The filtered record of the two `npx` runs is attached to the release as `gta6-mcp-0.1.3-verification.json`, with the wire logs beside it.
