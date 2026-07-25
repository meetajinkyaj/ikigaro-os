# ikigaro-os — Marketing Site

The Ikigaro landing page at **www.ikigaro.com**. A Cloudflare Worker serving a
self-contained static snapshot, with a small amount of edge-injected HTML.

The product itself is a separate repo (`meetajinkyaj/AI-Tools`, deployed to
`app.ikigaro.com`). **All waitlist CTAs on this site point there** — signup
happens in the app, not here.

---

## What's actually in this repo

```
public/index.html   the entire landing page — 12.4 MB, machine-generated
public/privacy      /privacy and /terms (hand-authored, own footers)
worker.js           serves assets + injects the legal footer and CTA retargeting
wrangler.toml       Worker config (assets binding, run_worker_first)
```

That's it. There is no build step, no framework, and no dependencies —
`package.json` exists only so the deploy workflow's `bun install` / `bun run
build` succeed (`build` is a deliberate no-op echo).

## Deploying

Push to `main`. `.github/workflows/deploy.yml` runs `bun install` → `bun run
build` (no-op) → `wrangler-action` deploy. Repo secrets: `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`.

Locally:

```bash
npx wrangler dev     # http://localhost:8787
npx wrangler deploy  # manual deploy
```

---

## The one thing you must understand before editing

**`public/index.html` is a 12.4 MB machine-generated snapshot that renders itself
client-side by compiling JSX in the browser with Babel.** Two consequences:

1. **The page you see does not exist in the served HTML.** The waitlist form,
   nav, and every section are inside escaped template strings that only become
   DOM after Babel runs. `HTMLRewriter` cannot reach any of it — it only sees the
   bootstrap.
2. **The bootstrap replaces the entire document as it renders.** Anything
   injected into the served HTML — including a `<script>` tag or an appended
   footer — is wiped from the DOM when the snapshot mounts. Window timers
   survive this; injected nodes and `MutationObserver`s bound to the old `body`
   do not.

This is why `worker.js` patches the page the way it does: it injects a script
that runs an **idempotent `apply()` on a persistent interval**, re-applying its
changes after every re-render. Each change checks before writing, and the legal
footer carries a stable id so it can't duplicate.

`apply()` currently:
- retargets every `a[href="#waitlist"]` to `https://app.ikigaro.com`
- replaces the email form with a "Sign up at app.ikigaro.com" button
- rewrites the section copy for the live private beta
- re-appends the legal footer (privacy/terms/contact) inside the rendered tree

It anchors on `data-dc-tpl` attributes, which are stable across re-renders. Every
lookup is defensive — a missing anchor leaves that element untouched rather than
throwing.

**To find an anchor for a new edit:** run `npx wrangler dev`, open the page in a
browser, inspect the element you want, and read its `data-dc-tpl` value. You
cannot find it by grepping `index.html` — it isn't there until render.

## Retired: the Notion waitlist

This site used to collect emails into a Notion database via `POST /api/waitlist`.
That's gone — the app has its own waitlist now. The route answers `410` with a
pointer to the app, for stale cached pages that still post to it. The
`NOTION_API_KEY` secret on the Worker is unused and can be deleted.

## Known debt: the snapshot itself

12.4 MB and in-browser JSX compilation means slow first paint on mobile, weak
SEO (content doesn't exist until JS runs), and — as above — hostility to any
edge-level change.

The fix is a hand-authored static rebuild: plain HTML/CSS, pre-rendered, a few
KB, which also deletes the patch-script workaround entirely. It's deferred
because it's a **design** project more than a code one — the live page is a rich
multi-section site, and rebuilding it risks visual regressions. Do it when
there's design capacity. Until then, treat `public/index.html` as frozen and make
changes through `worker.js`.
