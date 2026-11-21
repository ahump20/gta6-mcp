# GTA VI cheat / Easter-egg leads: YouTube + X

> Captured by a helper agent on 2026-11-21 as research notes. These are leads, not evidence. Only what `docs/VERIFICATION.md` says the reviewer re-checked was re-checked. Raw page copies were kept in a session scratch directory and are not in this repository.


Captured 2026-11-21 (UTC). Leads only; nothing here was tested and no video frames were inspected.

## Read this first

- **Pairs: 3 recital-level, 0 demonstrated.** Different channels, same named cheat, same console (PS5 buttons named, Xbox also claimed), identical sequences:
  - Attack Force, 9 steps: JOETHz (Y1, description text) + JackedBill (Y2, spoken 7:10 to about 7:18).
  - $250,000, 8 steps: JOETHz (Y1, spoken 1:32-1:41) + JackedBill (Y2, 3:06-3:15) + Thunderino (Y3, 2:19-2:27) + David Angello (Y7, description snippet).
  - Max Ammo, 10 steps: JackedBill (Y2, spoken 5:37-5:46) + David Angello (Y8, description snippet).
  - None of these is a demonstration. JackedBill says it relays third-party guides, JOETHz reads from a cheat website, the rest are text. In the four transcripts read, nobody describes entering a code and seeing it work. They are probably copies of the same published lists, not independent tests.
- **Best candidate for real on-screen entry is Y4 (GoldLeaf)**: its description says captured, voiceless footage of entering codes. Unread beyond that; needs a human look.
- **One excluded video matters: DPJ**, https://www.youtube.com/watch?v=a78-WeEiTRs. It is the only video whose own description says the uploader tested the codes and demonstrates what they do (Attack Force chapter at 03:07, 9 steps). The tool dates it 2026-11-18, so it is excluded by the cutoff. Search showed it as "2 days ago" at 10:47Z on Nov 21, so it went up after Nov 18 10:47Z. Reviewer's call.
- **Date-only stamps carry no timezone.** That cuts both ways: DPJ's Nov 18 could be Nov 19 UTC, and the Nov 19 rows could sit on either side of the cutoff by a few hours.
- **Attack Force dispute:** every Attack Force sequence captured here is the 9-step one (Y1, Y2, DPJ). No 8-step version turned up in what was read.
- **Disagreement with the brief:** the brief says about 19 published sequences with one disputed. Y3 counts 18 printed (17 agreed, one single-outlet: Raise Wanted Level) and names Unlimited Focus as differing at one outlet. Y3 does not mention an Attack Force dispute.
- **X returned nothing.** One search call, error verbatim: `X says the developer account is out of credits (HTTP 402). Add credits in the X developer console.` Not retried; second call not used. Zero X leads.
- **Post times are weak.** Search results carry a timestamp that is just fetch time minus N days (all end in 10:47:07-08Z), so those are written UNKNOWN. `video_get` returned a date at midnight (date-only precision); those are copied exactly.
- "2 days ago" at 10:47Z on Nov 21 spans Nov 18 10:47Z to Nov 19 10:47Z, so those rows are only kept where `video_get` confirmed Nov 19. The rest sit in "Date unconfirmed".

Budget used: 4 of 4 YouTube searches, 6 of 6 video_get, 4 of 4 transcripts, 1 of 2 X searches. No comments or replies tools called. No tool returned a credit error except X.

Capture times: searches about 2026-11-21T10:47:08Z (derived from the tool's own result timestamps, not a clock); video_get by 2026-11-21T10:48:59Z; transcripts by 2026-11-21T10:49:10Z (both from `date -u`).

## Kept leads: cheat codes (ranked top to bottom; IDs are labels, not rank)

Official eligible publisher channel (Rockstar, PlayStation, Xbox, IGN, GameSpot, Eurogamer, Polygon, PC Gamer): **no** for every row in this file. Transcript times are caption-segment starts, so a code can run a few seconds past the end shown.

| # | Platform | URL | Channel (handle / ID) | Post time UTC | Capture UTC | Evidence type | Claim (one line) | Transcript timestamps / cheat / platform | Official? |
|---|---|---|---|---|---|---|---|---|---|
| Y1 | youtube | https://www.youtube.com/watch?v=Hj23ZNatmZQ | JOETHz (@JOETHzz / UC2L3OXGAHCnn-mzEQkCDljw) | 2026-11-19T00:00:00.000Z (date-only) | 2026-11-21T10:49:10Z | gameplay_video (appears; narrator talks through opening the phone on screen) | Thai-language walkthrough of phone entry with L1+R1 held; speaks the $250,000 code and lists Attack Force as 9 steps in the description; says the game must be finished first; does not describe an effect appearing. | 0:58-1:17 phone + L1/R1 hold (PS5 buttons named); 1:32-1:41 $250,000 code spoken, 8 steps; 1:49-1:55 says phone icons move while pressing. Attack Force only in description (9 steps), not spoken. From transcript only, frames not inspected. | no |
| Y4 | youtube | https://www.youtube.com/watch?v=C7wrTvoDnww | GoldLeaf (@GoldxLeaf / UCjTmXtQgMC3dSNJ2q3auBSQ) | 2026-11-19T00:00:00.000Z (date-only) | 2026-11-21T10:48:59Z | gameplay_video (per description: captured, no commentary) | Description says it is a captured, voiceless guide to unlocking and entering codes on PS5 and Xbox; no code sequences are written in the description. | Transcript not fetched (description says voiceless, so the call was not spent). Named cheats unknown. Frames not inspected. | no |
| Y2 | youtube | https://www.youtube.com/watch?v=c-UFvg-X8O0 | JackedBill (@JackedBillGaming / UC2XPT2a3mW0cNFvbatgzyVA) | 2026-11-19T00:00:00.000Z (date-only) | 2026-11-21T10:49:10Z | text_claim (video recital; description says the codes are not all independently verified through gameplay) | Recites 17 codes for PS5 and Xbox from third-party guides, including Attack Force as a 9-step sequence, with every effect worded as reported. | 2:22-2:37 entry method (PS5 L1/R1, Xbox LB/RB); 3:06-3:11 $250,000; 3:50-3:57 Unlimited Focus; 4:22-4:26 Raise Heat Level; 4:54-5:03 Body Armor; 5:37-5:41 Max Ammo; 6:04-6:09 Infinite Ammo; 6:35-6:43 No Reload; 7:10-7:14 Attack Force (9 steps); 7:40-7:45 Exploding Balls; 8:17-8:22 Vehicle Force; 9:01-9:52 three vehicle spawns; 10:18-11:56 Cycle Weather + three filters. From transcript only, frames not inspected. | no |
| Y3 | youtube | https://www.youtube.com/watch?v=R-eujX74iZA | Thunderino (UCpJpb3wbcOvXy6Q5LNnH0WA; @handle not returned) | UNKNOWN (search said "1 day ago") | 2026-11-21T10:49:10Z | text_claim (video; compares what outlets printed) | Says 17 codes match across outlets that played the game and one more is printed by a single outlet; says one outlet's Unlimited Focus differs by two swapped inputs; lists kinds of codes it calls fake. | 1:43-1:58 entry method PS5/Xbox; 2:19-2:25 $250,000 spoken; 2:49-3:02 Unlimited Focus variant between outlets; 3:18-3:29 Raise Wanted Level single-outlet code; 3:48-3:54 Attack Force effect described, code shown on screen only; 5:39-7:05 list of claimed fakes (PC codes, phone numbers, GTA V effects). From transcript only, frames not inspected. | no |
| Y5 | youtube | https://www.youtube.com/watch?v=630BqbOSVRI | SubscribeForTacos (UC6O8VrqLUsIAcliEfe0-Jdg; @handle not returned) | UNKNOWN ("1 day ago") | 2026-11-21T10:49:10Z | screenshot (narrator says code tables are shown as images) | Says all 61 cheats are shown as on-screen images with code and unlock, some marked TBD; gives a category count (10 player, 11 combat, 21 vehicle, 3 environment, 16 filter). | 0:00-0:15 counts; 0:44-0:51 says codes are images to pause on; 0:51-1:08 TBD explanation. No code spoken, no platform-specific entry shown in speech. From transcript only, frames not inspected. | no |
| Y6 | youtube | https://www.youtube.com/watch?v=agXuBYUF_aU | How to Everything (@HowtoEverything01 / UCCMZ64wccR-qFxsSG1koAeQ) | 2026-11-19T00:00:00.000Z (date-only) | 2026-11-21T10:48:59Z | text_claim (title only; content unknown) | Title claims a full PS5 cheat list; description repeats the title and gives no codes. | Transcript not fetched (budget). Nothing known beyond the title. | no |
| Y7 | youtube | https://www.youtube.com/watch?v=jeX-AwfMRto | David Angello (UCPpzENV3VSY5mshFpwFrP3A; @handle not returned) | UNKNOWN ("1 day ago") | 2026-11-21T10:47:08Z | text_claim (description snippet) | Description gives the phone + L1/R1 entry method and a $250,000 D-pad sequence; title says five player cheats. | Search snippet only; no transcript fetched. PS5 buttons named. | no |
| Y8 | youtube | https://www.youtube.com/watch?v=Dh8R6ZmKZr8 | David Angello (UCPpzENV3VSY5mshFpwFrP3A; @handle not returned) | UNKNOWN ("21 hours ago") | 2026-11-21T10:47:08Z | text_claim (description snippet) | Description gives a 10-step Max Ammo sequence; title says eight more codes incl. Infinite Ammo, No Reload, bulldozer spawn. | Search snippet only. PS5 buttons named. Same channel as Y7, so not a pair with it. | no |
| Y9 | youtube | https://www.youtube.com/watch?v=LlBIpJhLEdg | Kuch Bhi Haat (UCTnob_-8aJGgldp4QWWLZPg; @handle not returned) | UNKNOWN ("1 day ago") | 2026-11-21T10:47:08Z | text_claim (description snippet) | Description is a table of cheat name, unlock and input, starting with $250,000. | Search snippet only. | no |
| Y10 | youtube | https://www.youtube.com/watch?v=EAd8gCnfFFs | How to Everything (@HowtoEverything01 / UCCMZ64wccR-qFxsSG1koAeQ) | UNKNOWN ("1 day ago") | 2026-11-21T10:47:08Z | text_claim (title only) | Title claims a way to use cheats early, which contradicts the story-lock other leads describe. | Search result only. | no |
| Y11 | youtube | https://www.youtube.com/watch?v=cKhxtfyBnjI | RaidAway (UCaMi81Bt9geDCcow-hHrP_Q; @handle not returned) | UNKNOWN ("1 day ago") | 2026-11-21T10:47:08Z | text_claim (title + snippet) | Says it explains what each of the 61 cheats does and when they can be used. | Search result only. | no |
| Y12 | youtube | https://www.youtube.com/watch?v=rvo0tSa1gM4 | dkdynamite (UCe1yEAEbnDWM7nVi3y2pjYw; @handle not returned) | UNKNOWN ("20 hours ago") | 2026-11-21T10:47:08Z | text_claim (title + snippet) | 20-minute video claiming to cover all 61 cheats and their unlock challenges. | Search result only. | no |
| Y13 | youtube | https://www.youtube.com/watch?v=1FFMPqTRetE | GTA6Videos (UCVXv-s3F4oQ9t1ui88j9FQg; @handle not returned) | UNKNOWN ("1 day ago") | 2026-11-21T10:47:08Z | text_claim (title + snippet) | Claims every code found so far, including the $250,000 one, across five categories. | Search result only. | no |

More cheat-list videos, date-safe from search ("1 day ago" or hours) but not individually read; all UNKNOWN post time, captured 2026-11-21T10:47:08Z, not official: `viwfXGK3uF4` (Zombie Slayer HQ), `jilyXgrRQzU` (ARHAMATED), `C00NgwhPw2g` (Marc Antony Gaming), `LWzlf492YBg` (DaSbro Tutorial), `1AiLln8qZdo` (Calibrash Gaming), `H-d25fOLW0A` (EKW the gamer), `IKUHtOI4tsY` (Mr.GHOST GAMING, Hindi), `zlqMkWOCHTQ` (OO Gamerz, Hindi), `cOPpKDuBEoQ` (Noah Explains). Several say "17 reported codes" in their snippets, i.e. recitals.

## Kept leads: Easter eggs / secrets

| # | Platform | URL | Channel (handle / ID) | Post time UTC | Capture UTC | Evidence type | Claim (one line) | Transcript timestamps | Official? |
|---|---|---|---|---|---|---|---|---|---|
| E1 | youtube | https://www.youtube.com/watch?v=Mj_beVHUJE4 | MrDalekJD (@MrDalekJD / UCMUP9j-QidC_S0KLlO06uCg) | 2026-11-19T00:00:00.000Z (date-only) | 2026-11-21T10:48:59Z | gameplay_video (per description) | Title claims an egg with a hidden cutscene; the description says the video is a climb of the tallest radio tower and only that reports mention a bird-nest egg nearby. Title and description disagree. | None; transcript not fetched. Frames not inspected. | no |
| E2 | youtube | https://www.youtube.com/watch?v=fpaUpkNONQE | Dynasty (UCIL-JFLvovsFao3vrsXGzag; @handle not returned) | UNKNOWN ("1 day ago") | 2026-11-21T10:47:08Z | gameplay_video (per title/snippet) | Claims a hidden ritual scene tied to zombies and a hidden achievement. | Search result only. | no |
| E3 | youtube | https://www.youtube.com/watch?v=chJwkuGNVHg | ZacCoxTV (UC2pdmlMIATaSfaxNuRTL4OA; @handle not returned) | UNKNOWN ("15 hours ago") | 2026-11-21T10:47:08Z | gameplay_video (per title/snippet) | Claims a full walkthrough that solves an alien secret mission. | Search result only. | no |
| E4 | youtube | https://www.youtube.com/watch?v=0t7bUWsUr-A | ZacCoxTV (UC2pdmlMIATaSfaxNuRTL4OA; @handle not returned) | UNKNOWN ("1 day ago") | 2026-11-21T10:47:08Z | gameplay_video (per title/snippet) | Second list of 30 secrets, including a side mission modelled on a comic-book character. | Search result only. | no |
| E5 | youtube | https://www.youtube.com/watch?v=_EnkF4qSd_w | Robbin Rams (UCLXzqg_ahPgFCU0JFGnsiqA; @handle not returned) | UNKNOWN ("1 day ago") | 2026-11-21T10:47:08Z | gameplay_video (per title/snippet) | Claims a hidden haunted hotel that appears in fog, likened to a horror game. | Search result only. | no |
| E6 | youtube | https://www.youtube.com/watch?v=UOOoHDzfhWk | SubscribeForTacos (UC6O8VrqLUsIAcliEfe0-Jdg; @handle not returned) | UNKNOWN ("1 day ago") | 2026-11-21T10:47:08Z | gameplay_video (per title/snippet) | Claims the location of a tribute car for a late film actor. | Search result only. | no |
| E7 | youtube | https://www.youtube.com/watch?v=psbmZnufSVQ | Ali-A Plays (UCgdywGAij6Nob5WealtDKXQ; @handle not returned) | UNKNOWN ("14 hours ago") | 2026-11-21T10:47:08Z | gameplay_video (per title/snippet) | List of 25 secret locations and events with a UFO first in the chapter list. | Search result only. | no |
| E8 | youtube | https://www.youtube.com/watch?v=grID99Qt21U | AHIREX (UCjOlfrHKJtAzvZH-H7Ef_uw; @handle not returned) | UNKNOWN ("23 hours ago") | 2026-11-21T10:47:08Z | gameplay_video (per title/snippet) | Round-up of open-world eggs in Leonida. | Search result only. | no |
| E9 | youtube | https://www.youtube.com/watch?v=bYQiFfC5afo | Diggy (UC6gDo-_ZlsmintiMLTkQVtQ; @handle not returned) | UNKNOWN ("1 day ago") | 2026-11-21T10:47:08Z | gameplay_video (per title/snippet) | Seven secrets, linked to a third-party interactive map. | Search result only. | no |

More Easter-egg videos, date-safe from search, not read: `9sBE_lGWzkE` (InkTV), `ZT_O_uZlmGM` (Chex Gang), `qRmenbse_Jc` (How to Everything), `LTW9xMbyJBg` (TheJizzy, "1 hour ago").

## Date unconfirmed (search said "2 days ago"; could be Nov 18; no video_get left)

Cheats: `Dt4gcsQRXcI` (KDJ; snippet says the game was already out in New Zealand), `I6dMXnurLYw` (Musty Sky), `6r_6Kw3ciDc` (KingAlexHD), `ORAc8ODl3mY` (Bubs; title promises unlimited money and health, which Y3 says are not in the list), `xA2f0sWmiEk` (Room 6), `oKznTIvxupk` (RoyaleMishMash), `shq-OM_kdcg` (Ezra Unlocked), `w4fCw-jHSyM` (Busted Guide).

Easter eggs: `bCKm934JnY0` (ZacCoxTV, 50 eggs), `V9JgeA64VYE` (T5G, 30 eggs, 1.65M views), `OT9VS3yBodM` and `D2nOcgWsG1k` (Robbin Rams: swamp bunker, sea monster), `k8aMwoTczx8` (Milo).

## Excluded: published before 2026-11-19

- https://www.youtube.com/watch?v=a78-WeEiTRs (DPJ, @dpjsc08 / UCqheS9rd4_nojHk3H-FR2XQ): video_get date 2026-11-18T00:00:00.000Z, captured 2026-11-21T10:48:59Z. Description lists 17 codes with per-cheat chapters 01:27 to 04:44 (Attack Force 03:07, 9 steps) and says the uploader tested them. See "Read this first".
- `f-MQ_GoDLHw` (TmarTn2): 7 days ago, pre-release.
- `r8MZClEHMLI` (GTA Insights): 6 days ago; its own snippet says found before launch from a leaked map.
- `iKVqPtDVN2A` (Taison TV): 3 days ago; about early-play bans, not codes.

## Excluded: recycled or wrong game

None. No title, description or transcript read here contained GTA V style button combos (shoulder or face buttons inside the code) or 1-999 phone numbers. Y1 says outright that face buttons are not used. Y3 claims such recycled lists are circulating but names no post.

## Out of scope (not cheat codes or Easter eggs)

`9dPRJVjtscQ` and `W5-Qic3UmW8` (money glitches), `cw6oLcZLEcM` (first-person glitch), `rmyoDvxiLMw` (PowerPyx tank trophy guide), `VwtL2C6Ihoo` (unrelated hacking video), general tips and reaction videos.

## Not checked

- No frames viewed for any video, so "shows the phone entry" is inferred from words only.
- Only 4 transcripts and 6 metadata pulls; everything else rests on a title and a truncated snippet.
- Comments were not read (by instruction), so viewer reports of codes failing or working are not captured.
