# gta6-mcp v0.1.0 design

Contract: [SPEC.md](../../../SPEC.md). Observations: [VERIFICATION.md](../../VERIFICATION.md).

## Review record (Build MCP Apps skill)

- **Deployment shape.** The skill defaults to remote HTTP. This server is local
  stdio on purpose: the brief fixes it, there is one user on one machine, no
  auth and no hosted infrastructure. Distribution is a checksummed release
  tarball run with `npx`.
- **Tool pattern.** Four actions, so one tool per action with tight schemas.
- **SDK.** `@modelcontextprotocol/server@2.4.0` (v2 line), not the v1
  `@modelcontextprotocol/sdk` the skill names.
- **No resources, prompts, elicitation or sampling.** Nothing here needs them.
- **Conversational flow.** A player asks Claude; Claude calls one tool; the tool
  returns a filtered envelope and a short text block built from that envelope.
  Tool descriptions tell the client to carry source, uncertainty and spoiler
  scope into its answer.

## Modules

| File | Responsibility |
| --- | --- |
| `src/index.ts` | Executable entry. `serveStdio(createServer)`; errors to stderr. |
| `src/server.ts` | `createServer()`: registers four tools, renders text from the envelope. |
| `src/schemas.ts` | zod input and output schemas, envelope, notice builders. |
| `src/net.ts` | The only place that calls `fetch`: URL policy, redirects, timeout, byte cap, retries, per-host queue, cache, in-flight sharing. |
| `src/wiki.ts` | MediaWiki client for both providers: search, parse, categories. Maps API errors. |
| `src/wikitext.ts` | Wikitext to bounded plain text; section split; cheat table and input parsing. |
| `src/evidence.ts` | Manifest schema, loader, policy validation, fingerprints, confidence decision. |
| `src/spoilers.ts` | Level ordering and registry lookups. |
| `src/tools.ts` | The four handlers. Pure functions of `(args, deps)` returning an envelope. |
| `data/evidence.json` | Reviewed manifest and spoiler registry. |
| `scripts/` | `validate-evidence.mjs`, `check-fixtures.mjs`, `smoke.mjs`. |

`deps` is `{ http, manifest, now }`. Tests pass a fake `fetch`, clock and
manifest; nothing in `src/` reads the clock or network any other way.

## Decisions

**One fetch per page.** `get_page` and `list_cheats` request the whole page
wikitext with `prop=wikitext|revid|tocdata` and split sections locally. One
cached request serves every section and spoiler level.

**Applicability by category.** After a Fandom search, one
`prop=categories` request for the hit titles decides which hits belong to
GTA VI. Wikipedia hits are kept when the title or snippet names the game.

**Fingerprints, not revisions.** `sha256` of whitespace-normalised text. A
review binds to the text of a table row, a section or a title. Pages change
many times a day; a row that did not change keeps its review.

**Cheat rows.** One row per table row and platform. The page names no platform,
so rows are `unattributed`. `entry_steps` come from the manifest and are shown
only while the "Activating cheats" section still has the reviewed fingerprint.

**Input parsing.** Split the code cell on commas. Each token must resolve to
Up, Down, Left or Right, either as plain text or through the mapping of
observed image links and alt text (`[[File:Xbox Left.png|25px|D-Pad Left]]`).
Any `{{template}}` left in the cell raises `unresolved_template`. Any token that
does not resolve makes the input `unknown` with a null sequence. Nothing is
guessed: Vehicle Force's "Left, Up Down" is `unknown`.

**Conflicts.** The manifest lists each variant with its own evidence. For a
cheat in an unresolved group the tool emits every recorded variant as
`conflicting`, attaches the live wiki row to the variant it matches, and adds a
further variant if the live row matches none.

**Confirmation needs a live re-read.** For an approved entry the tool fetches
each evidence URL without the cache-stale path and looks for text with the
reviewed fingerprint. Failure or mismatch downgrades the row and says why.

**Spoiler filtering last.** Handlers build a full internal result, then
`spoilers.ts` decides field by field what survives. The cache stores upstream
responses, never filtered output.

**Easter eggs.** The tool returns reviewed registry entries, then checks the
candidate page titles named in the manifest. With no reviewed entries and no
page, it returns `no_verified_results` and a `coverage_gap` notice.

## Agent review scope for v0.1.0

Reviewer: Claude (AI agent). Reviewed for spoiler class only, never for
truth: a set of index-level page titles, the lead and "Activating cheats"
sections of the cheats page, and each of the 18 cheat rows. Three unlock
requirements that name a specific find or the partner relationship are
classed `discovery`.

## Testing

Deterministic Vitest suite with fixtures; no live network in CI. Real captures
live in `tests/fixtures/real` with a manifest of URL, UTC time, revision,
licence and trimming. Invented material lives in `tests/fixtures/synthetic`,
marked `"synthetic": true`. A CI script fails if synthetic material appears
outside that directory or in `data/`. `npm run smoke` is the only thing that
talks to real upstreams.

## Revision 2: revised brief (2026-11-21, second session)

The build began in one Claude Code session from the first brief and was finished
in a second session that received a revised brief. The first session was stopped
at the owner's request; its commits are kept. The revision adds a third wiki
host (gta.wiki), a community-reports registry, a gameplay-video confirmation
rule, per-host permission checks, and a stricter client proof.

### Approaches: what to do with gta.wiki

Phase 0 found gta.wiki reachable, with GTA VI cheats and Easter egg pages that
the Fandom copy lacks, and found that its host's Terms of Use list "use our
Sites in an automated fashion without prior consent from the Company" among
disallowed activities, with no published API policy granting that consent and a
robots rule disallowing `api.php` for every crawler.

1. **Query gta.wiki as the primary provider.** Best coverage. Rejected: it
   breaks the host's published terms, and the brief says to drop unpermitted
   hosts.
2. **Ship the provider behind a consent switch** (an environment variable).
   Rejected for v0.1.0: `action=parse` was never probed there (probing stopped
   once the terms were read), so the code would be untested against the real
   host, and a switch invites use without consent.
3. **Keep `gtawiki` in the tool contract, make no request, say why.** Chosen.
   `get_page(source: "gtawiki")` returns `upstream_unavailable` with a
   `coverage_gap` notice; the gameplay tools name the gap; Fandom stays the
   primary provider and Wikipedia the background provider. The provider can be
   added in a later version once Weird Gloop consents.

### Other decisions in this revision

- The community registry is the `community_reports` array inside
  `data/evidence.json`, so one schema file covers the evidence manifest and the
  registry, and the package ships both in one reviewed file.
- Registry entries are strict objects: an unknown key such as `text` or `quote`
  fails validation. The only free text is the reviewer's own description.
- Each entry carries a reviewer-set `min_level`. The description is written by
  the reviewer, so disclosing it at or above that level cannot leak unreviewed
  source text.
- A lead without an absolute post time is not registered: applicability
  ("posted on or after 2026-11-19") cannot be shown without it.
- Video evidence reuses the confirmation entry shape with a `video` review
  record. The runtime never fetches a social host; a video-backed approval is
  trusted as reviewed and labelled so.

## Revision 3: Fandom is off by default

Read first-hand on 2026-11-21: Fandom's Terms of Use (last revised December 19, 2025) say a user must "not use any robot, spider, scraper or other automated means to access the Services for any purpose without our express written permission". Fandom publishes no API policy that grants it (Help:API does not exist on Community Central; Help:Bots covers editing bots only). Both GTA Wiki hosts are therefore closed to this server by their terms.

Approaches:

1. Keep Fandom on and note the conflict. Rejected: the brief says to follow each host's published policy.
2. Remove the Fandom provider. Rejected: it discards tested work, and an operator who holds permission would have no way to use it.
3. Keep the provider, refuse every Fandom request before the network unless the operator records the permission. Chosen.

This is the consent switch Revision 2 rejected for gta.wiki. The two hosts differ in one way that matters: the Fandom path is built and tested against captured responses, while gta.wiki's page-read call was never probed, so a gta.wiki switch would ship code no test has exercised. gta.wiki stays unqueried in v0.1.0.

Consequences: the setting is never set in the smoke run, CI, the Claude Code proof or the installed configuration, because nobody holds the permission. `list_cheats` with `include_unverified` still returns what the manifest records itself (unresolved conflict groups at their own reviewed level, and community reports). A conflict group with no reviewed level is shown at `full` only.
