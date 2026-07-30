# Avenir

**Your AI running companion.** Avenir coaches runners in real time — reading pace,
effort and rhythm, then talking them through every stride like an elite coach in
your ear.

This is a production-quality MVP built with a modern, scalable stack. It runs the
moment you start it (a fully-browsable **demo mode**), and upgrades to real
accounts + data the instant you connect Supabase.

---

## What's inside

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI system | shadcn/ui-style primitives + custom components |
| Animation | Framer Motion |
| Backend | Supabase (Postgres + Auth) |
| Hosting | Vercel |

### The experience

- **Landing page** — the premium front door, with live coaching preview.
- **Auth** — email/password sign-up + login (Supabase).
- **Dashboard** — greeting, today's coached session, weekly goal ring, recent runs.
- **Run** — the flagship. Choose a session, then a live, immersive coached run with
  real-time pace/heart-rate/cadence and Avenir talking you through it.
- **History** — every run, banked, with lifetime totals.
- **Profile** — your stats, preferences, light/dark toggle.
- **/design** — a living design-system styleguide (see `DESIGN.md`).

---

## Run it on your computer

You'll need [Node.js](https://nodejs.org) 20+ (you already have it).

```bash
npm install      # once, to install dependencies
npm run dev      # start the app
```

Then open **http://localhost:3000**. That's it — the app works immediately in demo
mode with realistic sample data. No account or setup required to explore it.

---

## Connect Supabase (real accounts + saved runs)

Demo mode is great for showing Avenir off. When you're ready for real users:

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates the
   tables, security rules, and the trigger that gives every new user a profile.
3. In **Project Settings → API**, copy your **Project URL** and **anon public key**.
4. In the project folder, copy `.env.example` to a new file named `.env.local` and
   paste your values in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Stop the dev server (Ctrl+C) and run `npm run dev` again.

Avenir now uses real authentication and saves every run to your database. The demo
banners disappear automatically.

---

## Install on your phone (PWA)

Avenir is a Progressive Web App — it installs to the home screen and launches
full-screen like a native app, no App Store needed:

- **iPhone (Safari):** open the site → Share → **Add to Home Screen**.
- **Android (Chrome):** open the site → menu → **Install app** (or the install prompt).

Installability (custom icon, standalone display, offline shell) works once the app is
served over HTTPS — i.e. after you deploy to Vercel below. The service worker is only
active in production, so local dev stays fast.

## Deploy to the web (Vercel)

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), click **Add New → Project**, and import
   that repository. Vercel detects Next.js automatically.
3. Under **Environment Variables**, add the same two values from your `.env.local`.
4. Click **Deploy**. In your Supabase project's **Authentication → URL Configuration**,
   add your new Vercel URL as a redirect URL.

Your app is live.

---

## How the AI coaching works

Avenir coaches you **during** the run, out loud, and talks back when you speak.

**The coach's voice (text-to-speech).** As the run unfolds, the coaching engine in
[`src/lib/coach.ts`](src/lib/coach.ts) reads your live state (pace vs. target, heart
rate, distance milestones, workout type) and produces short, human cues. Each new
line is spoken aloud through the browser's built-in speech synthesis — no external
service, works on any modern phone. Tap the speaker icon during a run to mute.

**Talking back — hands-free (speech recognition + conversation).** Tap **"Talk
hands-free"** once and Avenir listens continuously through whatever mic is active —
so with **AirPods** (or any Bluetooth headset) connected, you just speak, no need to
touch the phone. While the coach is talking, the mic pauses so it never hears itself.
Say something like *"I'm getting tired,"* and your words go, with the live run context,
to [`src/app/api/coach/route.ts`](src/app/api/coach/route.ts), which replies as the
coach and speaks it back:

- **With `ANTHROPIC_API_KEY` set** → generative, conversational coaching from
  Claude, primed with the coach persona and your running memory.
- **Without a key** → a built-in local responder (`src/lib/ai/responder.ts`) that
  still gives genuinely useful, in-character replies. So voice works with zero setup.

**Memory.** The coach reasons from what it knows about you — tendencies, strengths,
last week's runs — in [`src/lib/ai/memory.ts`](src/lib/ai/memory.ts). It's simulated
for the MVP but shaped exactly how a real system would aggregate it from your run
history, so nothing downstream changes when you wire in live data.

To enable generative coaching, add your key to `.env.local` (see `.env.example`):

```
ANTHROPIC_API_KEY=sk-ant-...
```

The coach runs on Claude Opus 4.8 by default. For lower latency and cost on
real-time replies, set `ANTHROPIC_COACH_MODEL=claude-haiku-4-5`. Live coaching is a
natural **premium feature** — the constant in-run cues are generated locally (free);
only talking to the coach calls the API (~$0.001–0.004 per reply).

> The live run currently **simulates** the pace/heart-rate/elevation stream so it works
> on any device without a wearable. To use real GPS, replace the simulation block in
> [`src/hooks/use-run-session.ts`](src/hooks/use-run-session.ts) with the browser's
> `navigator.geolocation.watchPosition` and a heart-rate source. It's marked with a
> comment. Voice input requires a browser that supports the Web Speech API (Chrome,
> Safari) and microphone permission.

---

## Project structure

```
src/
  app/
    (auth)/            login + signup screens
    (app)/             the authenticated product (dashboard, run, history, profile)
    auth/              server actions + OAuth callback
    design/            living design-system styleguide
    page.tsx           marketing landing page
  components/
    ui/                base primitives (button, card, input, badge, label)
    landing/           marketing sections
    app/               dashboard + navigation pieces
    run/               the live-run experience
    brand/, motion/    logo + reusable animations
  hooks/               use-run-session (the live run loop)
  lib/
    coach.ts           the coaching engine
    workouts.ts        the session library
    supabase/          client/server/proxy + types
    stats.ts, demo.ts  metrics helpers + demo data
supabase/schema.sql    database schema (run this in Supabase)
```

---

Built as a scalable foundation — clean architecture, typed end-to-end, and ready to
grow from MVP to a real product.
