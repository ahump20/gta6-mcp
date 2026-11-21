# gta6-mcp v0.1.0 specification

A local, headless stdio MCP server for someone playing Grand Theft Auto VI with
Claude Code open. It retrieves, extracts, normalises, filters and labels. Claude
explains. Every returned claim carries where it came from, how well it is
evidenced, and what limits apply.

Findings that shaped this spec are in [docs/VERIFICATION.md](docs/VERIFICATION.md).

## Non-goals

No account, key, LLM, paid API, database, vector store, UI, dashboard or hosted
infrastructure. No arbitrary-URL tool, crawling, general web search, or automatic
following of citations. No leaked or pre-release material. No PC or keyboard
cheat rows until a source documents them for GTA VI.

## Runtime

- Node `>=20`. TypeScript, `zod/v4`, `@modelcontextprotocol/server@2.4.0`.
- `serveStdio(createServer)`: one factory serves the legacy (2025) and modern
  (`2026-07-28`) eras. Protocol messages on stdout, diagnostics on stderr.
- User-Agent `gta6-mcp/0.1 (+https://github.com/ahump20/gta6-mcp)`.

## Source roles

| Role | Sources | Use |
| --- | --- | --- |
| Research lead | G2A, Gizdev, gta6cheatcodes.com | Offline research and documenting disagreement only. Never fetched at runtime, never confirming. |
| Community report | Reddit, X, YouTube, TikTok and forum posts | Captured offline, reviewed into the community registry shipped in `data/evidence.json`: link, author handle, post and capture times, evidence type and a reviewer-written one-line description. Never post text, images or video. Never fetched at runtime. Returned as `unverified` (or `theory`) reports. |
| Runtime retrieval, always on | `en.wikipedia.org/w/api.php` | Background on the game. Wikimedia's User-Agent policy and API etiquette permit identified API clients. |
| Runtime retrieval, off by default | `gta.fandom.com/api.php` (primary GTA Wiki provider) | Gameplay discovery and wikitext. Fandom's Terms of Use bar automated access without express written permission, and Fandom publishes no API policy granting it. The server requests Fandom only when its operator sets `GTA6_MCP_FANDOM_PERMISSION=granted`, which is a statement that Fandom has given that permission. |
| Known, not queried | `gta.wiki` (Weird Gloop) | The wiki the GTA Wiki community moved to on 15 March 2026 and where its GTA VI cheats and Easter egg pages are maintained. Its host's Terms of Use bar automated use without prior consent and none has been given, so the server never requests it. See [docs/VERIFICATION.md](docs/VERIFICATION.md) section 7. |
| Confirming evidence | Rockstar, Take-Two, PlayStation, Xbox, IGN, GameSpot, Eurogamer, Polygon, PC Gamer; gameplay videos in pairs under the video rule | Only through reviewed entries in the evidence manifest. Wikis supply candidates. |

## Network policy

Requests go only to the Wikipedia endpoint, to the Fandom endpoint when its
permission is recorded (otherwise the request is refused with `not_permitted`
before any network call), plus exact URLs listed in an
approved manifest entry whose host permits automated retrieval of that URL
(`runtime_recheck: "permitted"`). `gta.wiki` and every social platform are
absent from the allow-list, so a request to them is refused before any network
call. Each request and each redirect hop must be HTTPS, on
the default port, with no userinfo, and match an allowed endpoint or exact URL.
At most 3 redirects. User input travels only inside API query parameters.

- Timeout 10 s. Body cap 2 MB for wiki APIs, 3 MB for exact guide URLs.
- Shared per-host queue, one request per second.
- In-flight requests for the same URL are shared.
- Success cache: 200 entries, 1 hour. Failures are not cached.
- Up to 2 retries on HTTP 429 or 503, honouring `Retry-After` up to 5 s.
- When a refresh fails and an expired entry exists, it is returned labelled
  `stale_cache` with its original fetch time. A stale entry never confirms.
- HTML challenges, non-JSON bodies, HTTP errors, oversize bodies and API-level
  errors other than `missingtitle` count as unavailable.

## GTA VI applicability

A page applies when one of its categories matches `GTA VI`, or its own wikitext
names the game (`{{VI}}`, "Grand Theft Auto VI", "GTA VI", "GTA 6"). Search hits
from other games are dropped. Titles containing "leak" are never returned.

## Evidence

`data/evidence.json` is the reviewed manifest; `docs/evidence.schema.json` is its
JSON Schema. CI validates both structure and policy. An empty confirmation set is
valid and is what v0.1.0 ships.

A confirmation entry records: `claim_id`, game, cheat name, exact ordered input,
exact effect, one platform (`ps5` or `xbox-series`), input method, sourced
`entry_steps`, game version if known; then per evidence item the exact URL, a
minimal quote, evidence type, reporting lineage, independence rationale, a
fingerprint of the reviewed text and its capture time; then reviewer identity
and type, UTC review time, decision, and a one-line reason.

Approval of an uncontested claim needs one of:

1. `official_documentation` from a Rockstar, Take-Two, PlayStation or Xbox host.
2. `guide_own_test`: an eligible guide stating it tested that input, effect and
   platform itself.
3. `independent_report`: two or more eligible reports with different origins.
4. `gameplay_video`: two videos that each meet the video rule, from different
   accounts and different capture origins, agreeing on input, effect and
   platform.

A text post or a screenshot never confirms anything, whatever its reach.

**Video rule.** A video counts only when its review record says the reviewer
inspected frames (`review_basis: "frames"`) and saw continuous GTA VI footage
on an identified console, the exact sequence on screen or in the in-game
interface, and the stated effect right after entry. A review based on a title,
thumbnail, description, caption or transcript is rejected. The record holds the
URL, account, post time, entry and effect timestamps, what was visible at each,
whether button presses or only the on-screen sequence were visible, how frames
were inspected, the capture origin and the independence rationale. Reuploads,
clips, reactions and compilations share the origin of the footage they reuse.
One video alone leaves the claim `unverified`. Two approved claims for the same
cheat and platform with different inputs must be recorded as a conflict group.

**Community registry.** `community_reports` in the manifest holds reviewed
leads. An entry may not carry post text (unknown fields are rejected) and may
not be used as approval evidence: policy validation fails if a confirmation
cites a registry URL whose entry is not a `gameplay_video` that meets the video
rule, or cites a social host with any other evidence type. An empty registry is
valid.

**Re-check permission.** Each evidence item records `runtime_recheck`:
`permitted`, `not_permitted` (robots or terms bar automated retrieval of that
exact URL; the item is offline-reviewed only and its claim stays `unverified`),
or `review_only` (gameplay video; social platforms are outside runtime).

**Binding.** Fingerprints are SHA-256 over the reviewed quote or row only,
never the whole page, after the normalisation named in the manifest
(`collapse-whitespace-v1`: every run of whitespace becomes one space, ends
trimmed).

A site's reputation, a site-wide "tested" label, duplicated reporting, a wiki
citation and a GTA V reference do not count. Wiki hosts cannot be evidence.

A runtime row is `confirmed` only when all of these hold: the live candidate
matches the entry's name, input and platform exactly; the entry is approved and
passes policy; every evidence URL is fetched fresh and still contains text with
the reviewed fingerprint; the claim is in no unresolved conflict; and extraction
raised no issue for the input. Otherwise it is `unverified` or `conflicting`,
with the reason stated. A video-backed approval is the one case that cannot be
re-read: its evidence items carry `evidence_type: "gameplay_video"` and
`time_basis: "review"`, and the result adds a notice that the evidence was last
checked at review. It is downgraded in the manifest if a later review finds a
video removed, edited or contradicted.

Conflicts: comparable variants have their own `claim_id` and share a
`conflict_group_id`. An unresolved conflict overrides any approval. Resolution
needs an explicit entry backed by official documentation or two independent
direct verifications of the same variant, effect and platform. Videos that meet
the video rule count as direct verifications.

## Spoilers: default deny

Levels: `hints` (default) < `discovery` < `full`.

The manifest holds a spoiler registry: reviewed page titles, page sections,
cheat rows, entry steps and Easter egg entries. Each item has a minimum level
and, where it covers fetched text, a fingerprint of the text that was reviewed.

- In `hints` and `discovery`, a field is disclosed only if a registry item
  covers it at or below the requested level **and** the live text still has the
  reviewed fingerprint. Everything else is withheld with one generic
  `spoiler_withheld` notice: "Content withheld by spoiler policy."
- If a row cannot show its evidence or attribution safely, the whole row is
  withheld. If everything relevant is withheld, the result is `partial` with
  empty `results`.
- `full` returns bounded, attributed source text, labelled unreviewed and
  untrusted when no review covers it.
- Filtering runs on every call after the cache, on every serialised field. Text
  output is generated from the filtered envelope. No hint is ever invented.

## Tools

All four are read-only (`readOnlyHint: true`, `openWorldHint: true`), take an
optional `spoilers` argument, and return `structuredContent` matching their
`outputSchema` plus a short text summary of the same filtered result.

### Envelope

```
{ status, summary, results, sources, notices }
status:  ok | no_verified_results | not_found_page | not_found_section
       | upstream_unavailable | partial
source:  { title, url, revision_id?, retrieved_at, license, attribution }
notice:  { type, message }
type:    truncated | stale_cache | conflict | coverage_gap
       | unresolved_template | spoiler_withheld
```

`upstream_unavailable`: required retrieval failed. `partial`: usable coverage
survived a provider failure, or everything relevant was withheld.
`no_verified_results`: lookup worked and nothing eligible was found. Invalid
arguments are rejected by SDK validation; internal faults return `isError`.

### `search_gta6(query, limit?, spoilers?)`

Searches the two permitted wiki APIs. Each hit names its provider, and one
page's versions on different hosts are never merged. `limit` defaults to 5,
maximum 10. Result:
`{ title, snippet, url, provider, disclosure, evidence_label }`. `snippet` is
null when the provider gave none or when it is withheld.

### `get_page(title, section?, source?, spoilers?)`

`source` is `gtawiki`, `fandom` (default: the primary gameplay provider chosen
in Phase 0) or `wikipedia`. Without recorded Fandom permission the default
returns `upstream_unavailable` with a `coverage_gap` notice that names the
setting and points to `wikipedia`. `gtawiki` makes no request and returns
`upstream_unavailable` with a `coverage_gap` notice saying why. Follows
redirects and reports the resolved title. Result: `{ title, section, heading_path, text, references,
review_status, truncated }`. Text is capped at 20,000 characters. Missing page,
missing section and withheld content are three different outcomes.

### `list_cheats(platform?, include_unverified?, spoilers?)`

Default returns confirmed rows only. With `include_unverified: true` it adds
unverified and conflicting rows, labelled as reports. Row:

```
claim_id, name, input: string[] | null,
input_status: known | unknown | undiscovered,
input_method: d-pad | phone | unknown,
entry_steps: string[] | null,
platform: ps5 | xbox-series | unattributed,
effect, unlock_requirement, unlock_spoiler_class,
game_version: string | null,
confidence: confirmed | unverified | conflicting,
conflict_group_id: string | null,
evidence: [{ url, claim_text_reviewed, revision_or_fetched_at, time_basis,
             evidence_type?, social_platform?, author_handle?, posted_at? }],
reason, source_page_url
```

`time_basis` is `revision`, `fetched_at`, `captured_at` or `review`. With
`include_unverified: true`, reviewed community reports about a cheat are added
as `unverified` rows: the evidence item carries `evidence_type`
(`community_report` or `gameplay_video`), the social platform, author handle,
post time and link, and `reason` says the claim is a community report with no
eligible confirmation.

When the wiki's cheat table is not retrieved (Fandom off, or down) and
`include_unverified` is true, the tool still returns what the manifest itself
records: the variants of each unresolved conflict group (shown at the group's
reviewed `min_level`) and the community reports, with status `partial`. Without
the flag it returns `upstream_unavailable`, since a confirmation needs a live
candidate row.

`known`: a complete ordered sequence. `unknown`: omitted or failed extraction.
`undiscovered`: only when the source says so in words. `unattributed`: the
source names no platform; a `coverage_gap` notice says so, and a `platform`
filter does not match such rows.

### `easter_eggs(topic?, spoilers?)`

Result: `{ title, hint, detail, location, prerequisites, spoiler_class,
confidence, evidence_status: documented | theory | unverified, source_url,
community? }`. `documented` needs a reviewed registry entry. Reviewed community
reports are returned as `unverified` or `theory` with `community: {
social_platform, author_handle, posted_at }` and the post link as `source_url`.
When no reviewed hint exists the tool says so.

## Known coverage at release

Zero confirmed cheats. One recorded conflict (Attack Force). Out of the box
only Wikipedia is queried; the Fandom wiki needs its operator's recorded
permission, so the 18 source-reported cheat rows on its page are not returned
by default. `gta.wiki`, which
has GTA VI cheats and Easter egg pages, is not queried (consent required). No
GTA VI Easter egg page exists on the Fandom wiki, and no Easter egg has been
reviewed. Rockstar Support and GameSpot's live page were unreachable during
verification. The community registry and the results of the video review are
listed in docs/VERIFICATION.md section 9.
