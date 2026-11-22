# Spoiler policy

Default-deny: nothing is shown at a level unless a reviewer cleared that exact content for it.

## Levels

| Level | Returned |
|---|---|
| `hints` (default) | Only content a reviewer classified as safe at hints. |
| `discovery` | Also content classified for discovery, such as how or where to find something. |
| `full` | Everything retrieved. Unreviewed text is labelled as unreviewed source text. |

## Rules

1. A classification is bound to the content reviewed: a page title, a section's text, a cheat row or a registry entry. Section and row classifications carry a fingerprint (SHA-256 over the text with whitespace collapsed). If the text changes, the classification no longer applies and the content is withheld until it is reviewed again.
2. Filtering runs last, over the finished result, and the plain-text answer is built from the filtered result. A withheld field is `null` in the structured result and absent from the text; a withheld row or section is absent from both.
3. When something is withheld the result says so with a `spoiler_withheld` notice. It does not say what was withheld. For recorded Easter eggs it gives a count and names the levels that show them, so an assistant can ask again; a count reveals nothing about the game.
4. A cheat's unlock text has its own classification, separate from its name and input.
5. A recorded dispute or a community report is shown only at the level its reviewer set. One with no reviewed level is shown at `full` only.
6. Search snippets are unreviewed, so they are shown only at `full`. Below `full`, a title is shown only if it was reviewed.
7. Search never returns pages about leaks, at any level. At `full`, page text is still capped at 20,000 characters.

## What is reviewed today

The review record, with reviewer and time, is in `data/evidence.json` under `spoiler_registry`, each conflict group's `level_review`, and each community report's `review`. Reviews so far were made by an AI agent, and are labelled that way. They cover spoiler class only, not truth.
