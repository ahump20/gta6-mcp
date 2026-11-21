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

See section 6.

## 6. Leads checked by a research pass

Filled in below from sources read during the same session.

RESEARCH_PENDING
