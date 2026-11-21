# GTA VI cheat / Easter-egg leads: Reddit + TikTok

> Captured by a helper agent on 2026-11-21 as research notes. These are leads, not evidence. Only what `docs/VERIFICATION.md` says the reviewer re-checked was re-checked. Raw page copies were kept in a session scratch directory and are not in this repository.


Capture run: 2026-11-21, 10:47-10:49 UTC. Tool: claude-in-chrome extension only. Every tab this run opened is closed.

## Result: 0 leads captured

Neither platform showed any content. Nothing below is a judgement about whether leads exist; none could be read.

## Kept leads

| platform | URL | author | post time UTC | capture time UTC | evidence type | claim (neutral) | named cheat | console | D-pad sequence |
|---|---|---|---|---|---|---|---|---|---|
| (none) | | | | | | | | | |

## What happened, step by step

| step | URL attempted | outcome | observed (verified in the browser) |
|---|---|---|---|
| 1. Owner-supplied Reddit thread | https://www.reddit.com/r/GTA6unmoderated/s/3ZJFtKSupf | BLOCKED before load | The extension refused the navigation with the message "This site is not allowed due to safety restrictions." The page never loaded, so the short link was not resolved. |
| 2a. Reddit search, r/GTA6 | https://www.reddit.com/r/GTA6/search/?q=cheat%20code&restrict_sr=1&sort=new | BLOCKED before load | Same refusal, same message. |
| 2b. Reddit search, r/GTA6unmoderated | https://www.reddit.com/r/GTA6unmoderated/search/?q=cheat%20code&restrict_sr=1&sort=new | NOT ATTEMPTED | Reasoned, not verified: two reddit.com URLs out of two were refused with the same message, so the block looks domain-wide and a third try was skipped. |
| 3. TikTok search | https://www.tiktok.com/search?q=gta%206%20cheat%20codes | LOGIN WALL | Page loaded. Tabs "Top / Users / Videos / LIVE / Photo" appeared over grey placeholder tiles with no video titles, authors or dates. After about 20 seconds the page title changed to "Log in / TikTok" and a modal covered the results: "Log in to search for popular content", with QR code, phone or email, Facebook, Google and Apple options plus a sign-up link. Stopped there as instructed. No login, no dismissal of the modal, no other route tried. |
| 4. Forum threads (GTAForums etc.) | none | NOT REACHED | No Reddit post could be read, so no forum thread was pointed to. |

## Owner-supplied thread fields

| field | value |
|---|---|
| resolved canonical URL | UNKNOWN (short link never loaded) |
| post author | UNKNOWN |
| post time UTC | UNKNOWN |
| what the post claims or shows | UNKNOWN |
| top-level comments read | 0 |

## Excluded

None. No post or comment was read, so nothing was screened out.

## Counts

- Reddit posts opened: 0 of 8 allowed
- Reddit search queries run: 0 of 2 allowed (1 attempted, refused)
- TikTok leads: 0 of 6 allowed
- Forum threads opened: 0 of 2 allowed

## Notes for the reviewer

- The Reddit block comes from the Chrome extension's own site restrictions, not from Reddit and not from a sign-in problem (verified: the refusal came back before any page loaded). It will probably repeat on every run that uses this tool (reasoned). Reading the thread needs either the owner opening it and pasting the text or URL details, or a different approved tool.
- TikTok search needs a signed-in TikTok session in that Chrome profile. The profile was not signed in to TikTok at capture time (the left rail showed a generic "Profile" entry and the login modal appeared).
- An Adblock Plus cookie pop-up and a "TikTok Shop" banner were also on screen; neither was clicked.
- Tabs: the first context call (made with create-if-empty) returned one blank "New Tab" in a fresh tab group; the run then created its own working tab. Both were closed at the end and the group was removed. The blank tab's id was one below the working tab's, so it was most likely made by that first call (reasoned); it held only a blank new-tab page.
