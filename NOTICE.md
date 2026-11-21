# Notice: source content and credits

The code in this repository is MIT licensed (see LICENSE). The content the server returns, and the excerpts stored in this repository, belong to their sources and keep their own terms.

## Wikipedia

Text from `en.wikipedia.org` is by Wikipedia contributors, licensed under the Creative Commons Attribution-ShareAlike 4.0 International licence (https://creativecommons.org/licenses/by-sa/4.0/). The server extracts wikitext and reduces it to plain text. Every result links the page and gives its revision id.

## GTA Wiki on Fandom

Text from `gta.fandom.com` is by GTA Wiki contributors. Fandom states that wiki text is licensed under the Creative Commons Attribution-Share Alike License 3.0 (Unported) unless a wiki says otherwise (https://www.fandom.com/licensing, read 2026-11-21); this wiki's own rights record reads "CC-BY-SA" and points to that page.

- The server requests Fandom only when its operator has recorded Fandom's written permission.
- `tests/fixtures/real/fandom-*` are API responses captured on 2026-11-21 for tests, trimmed where the fixture manifest says so. They contain wiki text under the licence above and are not part of the installed package. Each fixture's page, revision and capture time are listed in `tests/fixtures/real/MANIFEST.json`.

## gta.wiki

Not used. `gta.wiki` content is licensed CC BY-NC-SA 3.0 and its host requires prior consent for automated use. This server makes no request to it and stores none of its text.

## Publisher guides

`data/evidence.json` quotes one line each from a GameSpot guide (through an Internet Archive capture) and a PC Gamer guide to document a disagreement. These are short quotations for reporting; all rights remain with the publishers. `tests/fixtures/real/guide-attack-force-excerpts.json` holds the same lines.

## Community posts

`data/evidence.json` lists community posts by link, author handle and post time, with a one-line description written by the reviewer. No post text, image or video is stored. All rights remain with each author.

## Code credits

- The list of wiki helper sub-pages skipped in search comes from Ro25v04/gta6-mcp (MIT).
- Built on the Model Context Protocol TypeScript SDK (`@modelcontextprotocol/server`) and Zod, under their own licences.

Grand Theft Auto is a trademark of Take-Two Interactive Software. This project is unofficial and is not affiliated with Rockstar Games or Take-Two Interactive.
