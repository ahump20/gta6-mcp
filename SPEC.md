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
| Research lead | G2A, Gizdev, gta6cheatcodes.com, X posts | Offline research and documenting disagreement only. Never fetched at runtime, never confirming. |
| Runtime retrieval | `gta.fandom.com/api.php`, `en.wikipedia.org/w/api.php` | Fandom: gameplay discovery and wikitext. Wikipedia: background. |
| Confirming evidence | Rockstar, Take-Two, PlayStation, Xbox, IGN, GameSpot, Eurogamer, Polygon, PC Gamer | Only through reviewed entries in the evidence manifest, at exact reviewed URLs. Wikis supply candidates. |

## Network policy

Requests go only to the two API endpoints above, plus exact URLs listed in an
approved manifest entry. Each request and each redirect hop must be HTTPS, on
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
3. `independent_reports`: two or more eligible reports with different origins.

A site's reputation, a site-wide "tested" label, duplicated reporting, a wiki
citation and a GTA V reference do not count. Wiki hosts cannot be evidence.

A runtime row is `confirmed` only when all of these hold: the live candidate
matches the entry's name, input and platform exactly; the entry is approved and
passes policy; every evidence URL is fetched fresh and still contains text with
the reviewed fingerprint; the claim is in no unresolved conflict; and extraction
raised no issue for the input. Otherwise it is `unverified` or `conflicting`,
with the reason stated.

Conflicts: comparable variants have their own `claim_id` and share a
`conflict_group_id`. An unresolved conflict overrides any approval. Resolution
needs an explicit entry backed by official documentation or two independent
direct verifications of the same variant, effect and platform.

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

Searches both wiki APIs. `limit` defaults to 5, maximum 10. Result:
`{ title, snippet, url, provider, disclosure, evidence_label }`. `snippet` is
null when the provider gave none or when it is withheld.

### `get_page(title, section?, source?, spoilers?)`

`source` is `fandom` (default) or `wikipedia`. Follows redirects and reports the
resolved title. Result: `{ title, section, heading_path, text, references,
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
evidence: [{ url, claim_text_reviewed, revision_or_fetched_at, time_basis }],
reason, source_page_url
```

`known`: a complete ordered sequence. `unknown`: omitted or failed extraction.
`undiscovered`: only when the source says so in words. `unattributed`: the
source names no platform; a `coverage_gap` notice says so, and a `platform`
filter does not match such rows.

### `easter_eggs(topic?, spoilers?)`

Result: `{ title, hint, detail, location, prerequisites, spoiler_class,
confidence, evidence_status: documented | theory | unverified, source_url }`.
`documented` needs a reviewed registry entry. When no reviewed hint exists the
tool says so.

## Known coverage at release

Zero confirmed cheats. One recorded conflict (Attack Force). No GTA VI Easter
egg page exists on the wiki, and no Easter egg has been reviewed. Rockstar
Support and GameSpot's live page were unreachable during verification.
