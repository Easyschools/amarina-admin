# Amarina Properties — Admin Panel (Vue 3)

CMS for [amarina-backend](../amarina-backend). Every page/section on the
public site (amarina-front) has an editable counterpart here — content
entities (projects, news, team, milestones, awards…), site-wide settings
(logo, hero copy, stats, footer, contact info, SEO defaults), and every
static UI label (nav, buttons, section headings), each with English +
Arabic fields side by side.

## Stack

Vue 3 + Vite + TypeScript, Pinia, vue-router (history mode), vue-i18n
(admin's own UI chrome only — see below), Tailwind CSS, Tiptap (news body
rich text), Axios.

## Setup

```bash
npm install
cp .env.example .env   # VITE_API_URL — defaults to http://localhost:8000/api/v1
npm run dev
```

Log in with the seeded admin account (`admin@amarina.test` / `password` —
see the backend README).

## Two different "translation" systems — don't confuse them

1. **The admin's own UI chrome** (Save/Cancel/nav labels/table headers) is
   static `vue-i18n` JSON at `src/i18n/{en,ar}.json`. Editing these requires
   a code change and redeploy — intentional, since this is an internal tool
   for the Amarina team, not public-facing content.
2. **Everything the public site shows** (nav labels, buttons, hero copy,
   project/news content, footer text…) lives in the database (`site_settings`
   / `ui_strings` / the content tables) and is edited right here in the
   admin, under **Site Settings**, **Site Content Labels**, and each content
   module. This is the "every single text and image is editable" layer.

## Routing / locale

Every route exists at both `/…` and `/ar/…` (`src/router/index.ts`, via an
optional `:locale(ar)?` path segment) — including `/login`. Vite's dev
server and the shipped `public/.htaccess` / `nginx.conf.example` both fall
back to `index.html` for any unmatched path, which is what prevents a hard
refresh on a deep route (e.g. `/ar/projects`) from 404ing in production.

## Production build

```bash
npm run build      # outputs dist/
```

Deploy `dist/` behind a web server configured with the SPA fallback — see
`public/.htaccess` (Apache) or `nginx.conf.example` (nginx) in this repo.
