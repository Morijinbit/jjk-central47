# Central 47 — Patch Notes

## v3.0.0 — Intelligence Core V3

The core is no longer a reply picker — it's a community simulator (RFC-002).
A post becomes a simulation event that runs the full layered pipeline before
one word of reply text exists:

- **Per-sentence claim extraction** — every sentence is decomposed into typed
  claims (identity, comparison, moral, accusation, threat, status, rumor,
  prediction, testimony...) with a verbatim kernel, so replies can quote the
  exact fragment they're arguing with.
- **Claim-level adjudication** — each claim is judged against canon:
  supported / contradicted / contested / open. Contradicted claims get the
  correction; open cases (the Naoya file) stay open — the board never
  confirms a culprit the canon hasn't.
- **Interpretive framing** — the post's register (ideology, grief, case-file,
  powerscale, rumor, listing, fear...) decides the register of the replies.
  A eulogy-manifesto gets its politics argued; it does not get powerscaled.
- **Behaviour before language** — the engine first decides who would reply
  and *what each poster is trying to do* (rebut this claim, answer that
  question, flag the threat line, cosign an earlier reply), then composes
  text move-by-move: verdict + quoted kernel + grounded canon fact + persona
  voice. No monolithic reply banks anywhere in the path.
- **Grounding invariant** — replies only assert facts from the canon packs.
  If no relevant fact exists, the move is dropped: silence over slop.
- **Taboo unites the board** — endorsing the genocide, supremacist posting,
  or mocking the Sanzaki dead gets zero agreeing replies, buried votes, and
  possibly the mod. Threats against named people get flagged as threats.
- **Community memory** — persistent world state now tracks recycled rumors
  ("this exact claim has circulated before"), standing narratives, poster
  reputation per subject, and topic exhaustion that shows up in the replies.
- **Roster of regulars** — recurring named posters with stances, expertise,
  and voice profiles who show up when their subjects come up — and stay
  silent when they have nothing to add.

The live-LLM path receives the same analysis as a structured brief, so
model-written replies and engine-written replies obey the same verdicts.

---

## v2.0.0 — The Intelligence Core

The whole reception/reply engine has been replaced. Every post now runs
through a real analysis pipeline before anything gets voted or replied to:

- **Semantic decomposition + context resolution** — parses the post against
  its thread title and parent, resolves nicknames/titles/pronouns to actual
  registry characters (e.g. "the barrier guy" → Tengen).
- **Knowledge graph** — a relationship graph between characters (teammates,
  rivals, family) that replies can draw on for lore-accurate callouts.
- **World State Model** — persistent, decaying, localStorage-backed memory of
  topic heat and community sentiment, so hot subjects (Sanzaki, the grid,
  the headship) stay hot and the board's mood carries between sessions.
- **Argument quality + emotion scoring** — reads evidence, hedging,
  certainty, and misinformation in a post, plus a multi-emotion read
  (anger, curiosity, mockery, fear...) rather than a single sentiment tag.
- **Misinformation correction** — false claims (e.g. "Koyara has a domain
  expansion") now get corrected in-thread instead of just downvoted.
- **Reputation ledger** — the board remembers known-credible posters and
  gives their takes a little more benefit of the doubt.

This sits underneath the existing vote/reply system from v1.3.0 — likes,
dislikes, and in-character replies still work the same way, they're just
reading a much deeper analysis of the post now.

---

## v1.4.0 — Compose overhaul + the Foundry reply fix

### Formatting is no longer flattened
Posts now **keep the paragraphs and line breaks** you typed. Previously a
carefully spaced post collapsed into one wall of text the moment you hit POST.

### Rich text in the composer
The new-thread box gained a formatting bar so your posts can look like the
long-form ones on the board:

- **Bold / italic / underline**
- **Four fonts** — MONO, DISPLAY, SERIF, SANS
- **Colour swatches** — phosphor, mint, cyan, amber, violet, danger, lime

Select text, hit a control. Formatting is sanitised on save and rendered
faithfully in the thread.

### Posts now get replies on Foundry (the big one)
Posting a **new thread** inside Foundry generated **zero** replies while
comment-replies worked fine. Cause: the thread's route switched ~380 ms after
the reply engine's guard checked it, so on Foundry (no live model → instant
local replies) every reply was dropped before the thread was "current." The
route is now set synchronously, so the in-character board reacts to fresh
posts everywhere.

### Two new boards
- **/THEORIES** — for takes like "Mira and Sora are the modern Gojo and Sukuna."
- **/GENERAL** — general discussion that didn't fit the other desks.

---

## v1.3.0 — The Reception Engine

The cursegate forum no longer hands out flat likes. Every post is now *read*
by a reception model, and both the vote counts and the replies react to what
you actually said.

### Likes & dislikes now mean something
A new scoring model reads each post and weighs:

- **Topic / character heat** — the Generation of Miracles, Sanzaki, the grid,
  the bounty carry huge ceilings; obscure names carry small ones.
- **Effort / genuineness** — argued, sourced, multi-sentence takes are rewarded.
- **Praise vs slander** — hyping a hero lands differently than dragging one.
- **Ragebait** — inflammatory takes go divisive (big up *and* big down).
- **Taboo** — condoning something vile (cheering the disaster, siding with the
  curses, celebrating deaths) gets **dogpiled** with heavy downvotes.

From those it computes *reach* × *approval* → realistic up/down that ramp up
over the post's first "minutes."

- A genuinely great take on a hot subject can climb into the **thousands**; the
  single hottest debates top out near **5000** and are meant to be hard to beat.
- Weak or obscure posts get tens, not hundreds.
- **Downvotes happen now** — every post draws some, and bad ones go net-negative.

### Replies read the same signals
The reply engine and the like counter share one reading of your post, so they
always agree about what just happened:

- Genuine, correct takes pull **agreement and concessions**.
- Slandering a beloved character summons **defenders**.
- Ragebait kicks off a **troll war**.
- A vile / condoning take triggers an **outrage dogpile** + a mod warning.
- Reply vote counts scale with the thread's heat too.

### Memory
The board now **remembers** what you keep posting about and calls it out
("that's your 3rd Sora post," "the barrier guy is back"). Persists across
sessions.

### Role / job flair (not personality tags)
Poster tags are now **roles and jobs** — GRADE 1, ZEN'IN CLAN, BOUNTY DESK,
BARRIER TECH, SENDAI LOCAL, CIVILIAN, KYOTO Y2 — instead of ANALYST / TROLL /
FUNNY labels.

### Voice
It's the internet — replies now carry realistic, unfiltered language where it
fits, without turning everything into noise.

### New recurring posters
- **grid_hollow** — grid-ops doomer tracking the failing barriers.
- **sendai_mother** — a civilian with kids in the northern evac zone.
- **kyoto_takumaki** — a cocky Kyoto second-year who will not drop the exchange
  event.

---
*Build:* `assets/central47.html` is the self-contained terminal loaded by the
Foundry module. Source of truth is `Central 47 Database copy.dc.html`; the
forum content library lives in `forum-replies.js` — append lines to any bank to
keep growing it.
