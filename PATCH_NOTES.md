# Central 47 — Patch Notes

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
