# gta6-mcp

A small MCP server for a player using Claude Code while playing Grand Theft Auto VI. It looks up cheats, Easter eggs and background on the game, and labels every answer with where it came from, how well it is supported, and what was held back.

The server retrieves, extracts, filters and labels. Claude explains. It never invents a cheat, an input or a source.

Unofficial. Not affiliated with Rockstar Games or Take-Two Interactive.

## What you get today

Read this before installing. It is deliberately strict.

- **Confirmed cheats: zero.** No cheat has met the confirmation rules yet. The published lists are reports, and the guides that print them do not say they tested each code.
- **One recorded dispute.** Attack Force is printed with 8 inputs by GameSpot and 9 by PC Gamer. Both are returned as reports, neither as a working code.
- **Two reviewed community reports**, as links with a one-line description: a video whose description lists the 9-input Attack Force sequence, and a video whose title reports an Easter egg at a radio tower. Neither is confirmed, and no video frames were inspected.
- **Wikipedia** for background on the game.
- **The GTA Wiki is not read out of the box.** Both of its hosts restrict automated access:
  - `gta.wiki` (Weird Gloop) does not allow automated use without prior consent. This server never requests it.
  - `gta.fandom.com` (Fandom) bars automated access without express written permission. The Fandom reader is built and tested but switched off. An operator who holds Fandom's permission turns it on by setting `GTA6_MCP_FANDOM_PERMISSION=granted`. Setting it states that you hold that permission.

Details and dated evidence for every line above are in [docs/VERIFICATION.md](docs/VERIFICATION.md).

## Install in Claude Code

Requires Node.js 20 or newer.

```sh
claude mcp add --scope local gta6 -- npx -y https://github.com/ahump20/gta6-mcp/releases/download/v0.1.0/gta6-mcp-0.1.0.tgz
```

That installs the release file. Its SHA-256 checksum is `9811c6fe105b469461e9f2569e309206ad6e3f3701135fd78ebe547e2bc757a9`, published beside it on the [release page](https://github.com/ahump20/gta6-mcp/releases/tag/v0.1.0).

Straight from the tagged source, which builds on install, also works:

```sh
claude mcp add --scope local gta6 -- npx -y github:ahump20/gta6-mcp#v0.1.0
```

Both commands were tested against the published release on Node 20 and passed the live protocol test; the record is the release's [verification log](https://github.com/ahump20/gta6-mcp/releases/download/v0.1.0/gta6-mcp-0.1.0-verification.json). One limit: on npm 10, the source route works with the tag but fails if you replace the tag with a full commit hash.

The package is published to GitHub Releases only, not to the npm registry. It needs no account, key or hosted service.

## Tools

All four are read-only and take an optional `spoilers` level: `hints` (default), `discovery` or `full`.

| Tool | What it does |
|---|---|
| `list_cheats` | Cheats with an evidence label. Confirmed only by default; `include_unverified: true` adds reports and disputes. Optional `platform`: `ps5` or `xbox-series`. |
| `easter_eggs` | Reviewed Easter eggs and secrets, and reviewed community reports, each labelled. Optional `topic`. |
| `search_gta6` | Search the approved wikis for GTA VI pages. |
| `get_page` | Read one page or section as bounded plain text. `source`: `fandom` (default, off unless permitted), `wikipedia`, or `gtawiki` (recognised, never requested). |

Every result has the same shape: `status`, `summary`, `results`, `sources` and `notices`.

- `status` is one of `ok`, `no_verified_results`, `not_found_page`, `not_found_section`, `upstream_unavailable`, `partial`.
- `notices` say what is missing or limited: `truncated`, `stale_cache`, `conflict`, `coverage_gap`, `unresolved_template`, `spoiler_withheld`.
- `sources` give the page or post, its licence and when it was read.

## Evidence labels

- `confirmed`: an exact match to a reviewed approval whose supporting text was re-read and still matches, with no open dispute. Approval needs official documentation, a guide's own stated test of the input, effect and platform, two independent reports, or two independent gameplay videos whose frames a reviewer inspected.
- `unverified`: reported by a source. Not a working code.
- `conflicting`: sources disagree. Each variant is returned with its source.

A wiki, a social post, a screenshot or a single video never confirms a cheat. The rules and the reviewed data are in [`data/evidence.json`](data/evidence.json), described by [`docs/evidence.schema.json`](docs/evidence.schema.json).

## Spoilers

Default-deny. Content is returned at a level only if a reviewer classified that exact content for it. Anything unreviewed is withheld at `hints` and `discovery`, and returned at `full` labelled as unreviewed source text. See [docs/SPOILERS.md](docs/SPOILERS.md).

## What it does not do

- It does not read Reddit, X, YouTube or TikTok at run time. Each needs an account and a credential.
- It does not enter cheats, play the game or change anything.
- It does not include leaked material.

## Related projects

- [LeonidaLab/gta6-mcp](https://github.com/LeonidaLab/gta6-mcp): release date, platforms, prices and editions, each marked official, reported or not announced. A good companion for those questions.
- [Ro25v04/gta6-mcp](https://github.com/Ro25v04/gta6-mcp): a reader for the Fandom GTA Wiki. This project borrows its list of helper sub-pages to skip in search.
- [Santy1422/gta6-mcp](https://github.com/Santy1422/gta6-mcp): lets Claude play the game on a PS5 through Remote Play.

## Develop

```sh
npm ci
npm run typecheck && npm test && npm run build
npm run validate:evidence && npm run check:fixtures
npm run smoke        # live protocol test, both protocol eras
```

## Licence

Code: MIT, see [LICENSE](LICENSE). Wiki text, publisher quotations and community links keep their own terms, see [NOTICE.md](NOTICE.md).
