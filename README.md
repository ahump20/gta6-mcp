# gta6-mcp

A small MCP server for a player using Claude Code or Codex while playing Grand Theft Auto VI. It looks up cheats, Easter eggs and background on the game, and labels every answer with where it came from, how well it is supported, and what was held back.

The server retrieves, extracts, filters and labels. Your assistant explains. The server never invents a cheat, an input or a source.

Unofficial. Not affiliated with Rockstar Games or Take-Two Interactive.

## What you get today

Read this before installing. It is deliberately strict.

- **Confirmed cheats: zero.** No cheat has met the confirmation rules yet. The published lists are reports, and the guides that print them do not say they tested each code. The frames of five launch-week videos were inspected: every one shows codes as captions or cards, and none shows a code being entered or its effect.
- **Eighteen reported codes, all unverified.** With `include_unverified: true`, `list_cheats` returns each code's name and the D-pad sequence one video captions for it, with the link. No platform and no effect is attached, because the video shows neither. Treat them as leads to try, not working codes.
- **One recorded dispute.** Attack Force is printed with 8 inputs by GameSpot and 9 by PC Gamer. Three videos show the 9-input version as text. All are returned as reports, none as a working code; three videos repeating a list is not three tests.
- **Eighteen reported Easter eggs**, all unverified, shown from the `discovery` level up. Seventeen are listed by at least two published guides, such as Dexter's apartment, the Skunk Ape and the dog on a jet ski; each entry names its listings and says this project has not seen it in the game. The eighteenth is a video of a radio tower climb whose frames show a nest and an egg at the top.
- **A default call returns no rows, and says so.** With no confirmed cheats and spoilers off, `list_cheats` and `easter_eggs` answer with a count of what is on record and the argument that shows it: `include_unverified: true`, or `spoilers: "discovery"`.
- **Wikipedia** for background on the game.
- **The GTA Wiki is not read out of the box.** Both of its hosts restrict automated access:
  - `gta.wiki` (Weird Gloop) does not allow automated use without prior consent. This server never requests it.
  - `gta.fandom.com` (Fandom) bars automated access without express written permission. The Fandom reader is built and tested but switched off. An operator who holds Fandom's permission turns it on by setting `GTA6_MCP_FANDOM_PERMISSION=granted`. Setting it states that you hold that permission.

Details and dated evidence for every line above are in [docs/VERIFICATION.md](docs/VERIFICATION.md).

## Install in Claude Code

Requires Node.js 20 or newer.

```sh
claude mcp add --scope local gta6 -- npx -y https://github.com/ahump20/gta6-mcp/releases/download/v0.1.3/gta6-mcp-0.1.3.tgz
```

That installs the release file. Its SHA-256 checksum is `21dfeda594294a1ec5f68d7bbbe72a89793190c47ec529e69c1d8d82df8928ec`, published beside it on the [release page](https://github.com/ahump20/gta6-mcp/releases/tag/v0.1.3).

Already installed an earlier version? Run `claude mcp remove gta6 --scope local` first, then the command above.

Straight from the tagged source, which builds on install, also works:

```sh
claude mcp add --scope local gta6 -- npx -y github:ahump20/gta6-mcp#v0.1.3
```

Both commands were tested against the published release on Node 20 and passed the live protocol test on both protocol versions; the record is the release's [verification log](https://github.com/ahump20/gta6-mcp/releases/download/v0.1.3/gta6-mcp-0.1.3-verification.json). One limit: on npm 10, the source route works with the tag but fails if you replace the tag with a full commit hash.

The package is published to GitHub Releases only, not to the npm registry. It needs no account, key or hosted service.

## Install in Codex

Requires Node.js 20 or newer. Install the same release file once, then point Codex at it:

```sh
npm install -g https://github.com/ahump20/gta6-mcp/releases/download/v0.1.3/gta6-mcp-0.1.3.tgz
codex mcp add gta6 -- gta6-mcp
```

`codex mcp list` shows it, and `/mcp` shows it inside Codex. npm 11 prints a note that the package's build script was skipped. That is expected: the release file is already built.

Codex saves this in `~/.codex/config.toml`. OpenAI's documentation says the Codex CLI, the ChatGPT desktop app and the IDE extension share that file.

Install first, because Codex gives a server about one second to start before it answers. Installed, this one starts in a tenth of a second. Through `npx` it took 5 seconds, and 11 on the first download, so Codex answered without the tools.

To run it through `npx` anyway, with nothing installed, put this in `~/.codex/config.toml` instead:

```toml
[mcp_servers.gta6]
command = "npx"
args = ["-y", "https://github.com/ahump20/gta6-mcp/releases/download/v0.1.3/gta6-mcp-0.1.3.tgz"]
required = true
startup_timeout_sec = 60
```

`required` makes Codex wait for the server. It also means Codex reports a startup failure whenever the server cannot start, for example with no network.

An operator who holds Fandom's permission passes the setting with `--env`: `codex mcp add gta6 --env GTA6_MCP_FANDOM_PERMISSION=granted -- gta6-mcp`.

To remove it: `codex mcp remove gta6`, then `npm uninstall -g gta6-mcp`.

Both routes were tested with Codex CLI 0.166.0 on v0.1.1 and returned the same 22 reports Claude Code gets. The installed route was run again on v0.1.3 with a plain question, and Codex returned the 18 code names and 18 Easter eggs. The desktop app and the IDE extension were not run. The record is sections 20, 22 and 24 of [docs/VERIFICATION.md](docs/VERIFICATION.md).

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
