# Live protocol test

`npm run smoke` starts the built server as a child process over real stdio and calls every tool against the real upstream services, once per protocol era:

- **legacy**: the client negotiates through `initialize`.
- **modern**: the client pins revision `2026-07-28` and negotiates through `server/discover`.

Every server process is started through `scripts/tee.mjs`, a development-only wrapper that records each line sent in either direction to a wire log. The wrapper is not part of the installed package.

For each call the test checks that the tool did not return an error, that the structured result matches the tool's output schema, that the text answer is built from the structured result, and that every source has a link, a retrieval time and a licence. An unreachable or switched-off upstream is reported as coverage, not as a failure.

The Fandom permission setting is never set for this test.

```sh
npm run build
npm run smoke -- --out report.json
# against an installed copy:
npm run smoke -- --out report.json -- node /path/to/node_modules/gta6-mcp/dist/index.js
```

## Recorded run

[`docs/smoke/local-node20.json`](smoke/local-node20.json): Node v20.20.2, npm 10.8.2, SDK client and server 2.4.0, 2026-11-21. The file records the commit it tested and both wire logs sit beside it. Local paths are reduced to placeholders.

| Tracked value | Result |
|---|---|
| `legacy_protocol_pass` | true (negotiated `2025-11-25`) |
| `modern_protocol_pass` | true (negotiated `2026-07-28`) |
| `provider_statuses` | gta.wiki: never requested. gta.fandom.com: not permitted, no request made. en.wikipedia.org: reachable. |
| `gameplay_coverage` | 0 confirmed cheats. 3 reports returned with `include_unverified` (the two Attack Force variants and one community report). 1 community Easter egg report at `discovery`. |

The same test passed against the packed tarball installed into an empty folder with an empty npm cache under Node 20. The run against the published release is attached to the release as its verification log.
