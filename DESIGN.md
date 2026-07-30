# The Avenir Design System

A dark-first visual language for an AI running companion. Built to feel
**futuristic, intelligent, calm, motivating, and premium** — the restraint of
Whoop, the elegance of Apple Fitness, and the athletic energy of the run itself,
without imitating any of them.

> See it live at **`/design`** while the app is running.

---

## 1. Design principles

1. **Calm at rest, alive in motion.** The interface is quiet and dark until
   something matters — a coaching cue, a milestone, a finish. Emphasis is earned.
2. **One canvas, two accents.** A single deep near-black backdrop; lime for energy
   and action, violet for intelligence and coaching. Colour is a signal, never
   decoration.
3. **Numbers are the hero.** Metrics use large, tabular figures that never jitter.
   The data is the product; the chrome gets out of its way.
4. **Thumb-first.** Everything reachable one-handed, mid-run. The primary action is
   always the most prominent thing on screen.

---

## 2. Color

Authored in **OKLCH** for perceptually even gradients and reliable contrast.
Tokens live in [`src/app/globals.css`](src/app/globals.css) and are consumed as
Tailwind theme colours (`bg-primary`, `text-muted-foreground`, …).

### Core (dark, default)

| Token | Role | Value |
| --- | --- | --- |
| `--background` | The canvas — deep, cool near-black | `oklch(0.16 0.014 264)` |
| `--card` | Lifted surface | `oklch(0.20 0.016 264)` |
| `--foreground` | Primary text | `oklch(0.97 0.005 260)` |
| `--muted-foreground` | Secondary text | `oklch(0.68 0.014 264)` |
| `--primary` | **Electric lime** — energy + primary action | `oklch(0.88 0.19 128)` |
| `--accent` | **Cool violet** — AI + coaching moments | `oklch(0.62 0.17 285)` |
| `--destructive` | Effort, heart rate, stop | `oklch(0.65 0.20 25)` |
| `--border` | Quiet hairlines | `oklch(0.30 0.016 264 / 60%)` |

### Usage rules

- **Lime** is precious. Primary buttons, the active run control, progress toward a
  goal, "on-pace" states. If everything is lime, nothing is.
- **Violet** belongs to Avenir's voice — the coaching feed, the AI badge, "coach's
  note". It signals intelligence.
- **Destructive red** is reserved for heart rate and stop/finish — physiological
  intensity, not errors alone.
- A light theme ships for accessibility, but the product is designed dark.

### Signature surfaces

- `.aurora` — a soft dual radial glow (lime + violet) behind heroes and coaching.
- `.glass` — frosted blur used for navigation and the live coaching card.

---

## 3. Typography

**Geist Sans** for everything; **Geist Mono** available for code-like contexts.
Metrics always use `tabular-nums` so digits don't shift as they change.

| Style | Spec | Use |
| --- | --- | --- |
| Display | 48–60px, semibold, tight tracking | Hero headlines |
| H1 | 30px, semibold, `-tracking-tight` | Screen titles |
| H2 | 20px, semibold | Section + card titles |
| Body | 16px, `muted-foreground` for secondary | Paragraphs |
| Numeric | 32–72px, semibold, `tabular-nums` | Live metrics |
| Label | 12px, uppercase, `tracking-widest`, muted | Metric captions |

Rhythm: tight tracking on large text, generous line-height on body, uppercase
micro-labels to frame data.

---

## 4. Buttons

Pill-shaped (`rounded-full`), tactile, with a confident press (`active:scale-97`).
Defined in [`src/components/ui/button.tsx`](src/components/ui/button.tsx).

| Variant | Use |
| --- | --- |
| `default` | Primary action. Lime with a soft glow shadow. One per view. |
| `secondary` | Supporting action on a surface. |
| `outline` | Low-emphasis alternative (e.g. "Try the demo"). |
| `ghost` | Tertiary / nav-like actions. |
| `destructive` | Finish / stop, when confirmation matters. |

Sizes: `sm` (36px), `default` (44px), `lg` (56px), `icon` (44²). Minimum 44px tall
for comfortable touch targets.

---

## 5. Cards

Soft surfaces, generous radius (`rounded-2xl`/`3xl`), quiet borders, subtle depth.

- **Standard card** (`bg-card`) — the default content container.
- **Glass card** (`.glass`) — frosted, for navigation and live coaching.
- **Aurora card** — the "today's session" and CTA blocks, with the ambient glow and
  a hairline light along the top edge.

Cards never shout: elevation comes from a lighter surface + a thin border, not heavy
shadows.

---

## 6. Navigation

A **floating dock** (`.glass`, `rounded-full`), thumb-reachable at the bottom, with
four destinations and **one elevated primary action** (Run) in the centre as a lime
circle. The active tab is marked by a soft pill that animates between items
(`layoutId` spring). The dock **hides entirely during an active run** so the
experience is fully immersive and nothing competes with the live controls.

Defined in [`src/components/app/bottom-nav.tsx`](src/components/app/bottom-nav.tsx).

---

## 7. Motion

Powered by **Framer Motion**. Purposeful and physical — motion communicates state,
it never decorates.

- **Signature easing:** `[0.22, 1, 0.36, 1]` (a confident ease-out) for entrances.
- **Reveal on scroll:** content fades + lifts 24px into place, staggered for lists
  ([`src/components/motion/reveal.tsx`](src/components/motion/reveal.tsx)).
- **Progress rings** animate their stroke from empty on mount (~1.1s) — the goal
  filling in feels like earning it.
- **Coaching cues** cross-fade with a short y-shift as the newest line takes the
  spotlight and older lines drop into the transcript.
- **Press feedback:** interactive elements scale to 0.97 on tap.
- **Respect intent:** transitions are short (0.3–0.6s); nothing blocks the runner.

---

## 8. Component library

Composable building blocks, all typed and theme-aware:

| Component | Purpose |
| --- | --- |
| `Button`, `Badge`, `Input`, `Label` | Base primitives |
| `Card` family | Content surfaces |
| `ProgressRing` | Animated circular progress (goals, run completion) |
| `MetricTile` | A single large, tabular live readout |
| `CoachFeed` | The spotlight + transcript of Avenir's coaching |
| `TodaySession` | The dashboard's headline coached-session card |
| `Logo` / `LogoMark` | The forward-leaning chevron motion-mark |
| `Reveal` | Scroll-triggered entrance wrapper |

---

## 9. Voice & tone

Avenir speaks like a coach who is *next to you*, not a tracker reading numbers.
Short. Warm. Specific. Present-tense. It celebrates effort over ego, and recovery as
part of the work.

> "Locked in. Beautiful rhythm — keep it turning."
> "Ease back a hair — save that fire for later."
> "That's the run. Outstanding work today — be proud of that one."

The copy engine and its tone banks live in [`src/lib/coach.ts`](src/lib/coach.ts).
