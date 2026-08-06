# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single static-HTML marketing/landing page for Dra. Ana Laura Paz García, a pediatric allergist in Puebla, México, built to receive Google Ads traffic. There is no backend, no build step, and no package manager — the entire site is `index.html` plus `assets/` and `images/`, deployed as-is (e.g. via GitHub Pages, per `CNAME` pointing to `www.draanalau.com`).

Stack is intentionally plain HTML + CSS + vanilla JS — no frameworks, no jQuery, no build tooling. The site was rebuilt mobile-first for Core Web Vitals / Google Ads Quality Score: total page weight (`index.html` + `assets/` + `images/`) is ~260KB, down from ~9.6MB in the original HTML5UP-template version.

## Development

There is no build/lint/test tooling in this repo (no `package.json`). To work on the site:

- Edit `index.html`, `assets/css/main.css`, `assets/js/main.js` directly — all three are already the "production" files, hand-written and reasonably compact; there is no separate source/dist step.
- Preview locally by serving the directory, e.g. `python3 -m http.server 8811`, then open `http://localhost:8811/index.html`.
- Deployment is just pushing to the branch GitHub Pages serves from.
- After any layout change, check both a narrow mobile width (~375–390px) and desktop (~1280px+) — this is a mobile-first design and most real traffic is mobile.

## Structure

- `index.html` — the entire page. Sticky header (`#header`) with logo, a checkbox-driven mobile nav drawer (`#nav-drawer`, see below), inline phone/WhatsApp CTAs on desktop; fixed floating phone/WhatsApp buttons (`.float-actions`) on mobile; then `<main>` with `#inicio` (hero), `#sobre-mi` (bio/experience/certifications/publications as a card grid), `#servicios` (service cards), `#contacto` (contact cards + payment logos); then `<footer>`. An inline SVG `<symbol>` sprite near the top of `<body>` holds every icon used on the page (referenced via `<use href="#icon-name">`) — there is no icon font/library.
- `assets/css/main.css` — the only stylesheet, mobile-first (base rules target mobile; `min-width` media queries layer on tablet/desktop at `40em`/`60em`). Palette lives in CSS custom properties at the top (`--bg`, `--accent1/2/3`, etc.) — keep any color changes there rather than hardcoding hex values in rules.
- `assets/js/main.js` — small vanilla script (~2KB) handling three things only: closing the mobile nav drawer (on link click / outside click / Escape), highlighting the active nav link via `IntersectionObserver` as the user scrolls, and toggling `.is-offscreen` on the hero **and every `.section`** so their decorative animations pause while off screen. There is no other client-side JS on the page.
- `images/` — already-optimized WebP images (converted/resized with `sips`/`cwebp`; source PSDs/originals are not kept in the repo) plus `images/Pagos/` (payment method logos). `images/logo-og.jpg` exists only for the `og:image` meta tag (social-share crawlers, not the page itself) — don't repurpose it for on-page use.
- `CNAME` — custom domain for GitHub Pages.
- `tools/gen-dandelion.py` — regenerates the hero dandelion's seed head inside `index.html` (see below). Run by hand when the flower's density needs changing; nothing else uses it.

## The hero dandelion (`.hero-art`)

The illustration behind `#inicio` is a hand-written inline SVG (`.dandelion`, viewBox `0 0 520 620`) that recreates the diente de león from the logo, loosely composed after the reference photo `dienteleon.jpg` (flower on one side, seeds drifting across the frame). Points worth knowing before editing it:

- It is a **direct child of `.hero`**, not of `.hero-inner` — it is `position: absolute; inset: 0` and needs `.hero` as its containing block. `.hero::after` is the veil that keeps the copy legible over it; `.hero-copy` sits above both via `z-index`.
- The "full-bleed with fade" effect is a `mask-image: radial-gradient(...)` on `.hero-art` plus per-breakpoint `top/right/height` on `.dandelion` (it is deliberately larger than the hero and cropped by `overflow: hidden`). Percentage `margin` does **not** work for vertical offsets here — percentages resolve against the container *width*.
- **The composition flips at `60em`**: below it the plant sits on the right with the copy over it; from `60em` up it is mirrored — `.dandelion` anchors `left`, the seeds cross the full width to the right (`--travel` on `.dl-flyers` lengthens their trip), `.hero-copy` gets `margin-left: auto`, and the `.hero::after` veil + the hero's own radial glow are mirrored to match (`260deg`, glow at `18%`). Change one of those and the other three need the same treatment.
- `.hero` clips with `overflow: hidden`, so anything reaching its bottom edge gets cut off flat. `.hero::before` is the gradient that dissolves the stem into the background before that happens — the stem's own gradient fades out too, but where the cut lands in SVG coordinates depends on the breakpoint, so the overlay is what actually guarantees no hard edge.
- The stem is **two filled, tapered paths**, not a stroke: `.dl-stem-low` (base) and `.dl-stem-up`, meeting at `y=400` where they share the exact same edge coordinates. They fill from one `userSpaceOnUse` gradient so the ramp is continuous across both. `.dl-plant` rotates the whole plant a little at the base, and `.dl-bend` (the upper path + head) repeats the same swing with a negative delay so the stem *bends* instead of pivoting like a rigid stick — that lag is the whole point, don't sync the two.
- `.dl-fluff` is a soft radial-gradient circle behind the seeds that keeps the sphere from reading as line art. On mobile, `.dl-head use:nth-child(3n)` is hidden: ~50 fewer strokes to repaint per frame at a size where the thinning is invisible.
- **The head is generated, not hand-drawn — regenerate it with `tools/gen-dandelion.py`, never by editing the `<use>` list.** Every seed is the same `<use href="#dl-ray-N">` (three curvature variants, all *exactly* the same length) placed with `rotate()` + `scale()`. The scale is not size variation: directions are sampled uniformly over a sphere and the scale is the projection `sin φ`, so a seed pointing at the viewer looks short and one seen edge-on draws the silhouette. That is what fills the disc without concentric rings while keeping every petal the same size — earlier attempts with jittered lengths looked lopsided, and with three fixed radii looked like a mandala. `.dl-l1`…`.dl-l4` are the depth bands (|z| ranges) carrying stroke width and opacity; `LAYERS` in the script is the only knob for density. Note the sphere projection crowds seeds at the rim on its own, so the inner bands are deliberately over-populated relative to a physically uniform sample — otherwise the middle of the flower looks bald next to the edge. The script is idempotent and is *not* part of a build — `index.html` stays the production file.
- Because seeds are `<use>`d and rotated, `#dl-grad` is `userSpaceOnUse` **in the ray's own coordinates** (green at the core, white at the tip). The flying seeds keep their own per-bbox ramp, `#dl-seed-grad` — don't merge the two back together.
- Flying seeds (`.dl-flyers`) are generated by the same script (`N_FLY`) and are **nested groups**, one animation each (`.dl-fly` advance → `.dl-fly-y` rise → `.dl-fly-w` wobble → `.dl-fly-r` spin). Each seed carries its own `--dur`/`--delay` inline — the delay is a staggered negative value so seeds are spread along the trajectory instead of launching together — while the wobble/spin durations come from `nth-child` rules in the CSS, deliberately out of step so no two seeds move alike. Half of them are hidden below `60em` (4 nested animations each).
- The whole plant reads as wind-blown: `dl-sway`/`dl-bend` never cross zero, they hold a lean to the right (the direction the seeds fly) and only vary how far it gives. If you ever mirror the composition, flip the sign on both or the plant will lean into the wind.
- Everything pauses off-screen via `.hero.is-offscreen` (set from `main.js`) and is disabled under `prefers-reduced-motion` — the global `animation-duration: 0.01ms` rule alone would make the seeds flicker, so they get an explicit `display: none`.

## The gallery carousel (`#galeria`)

Infinite carousel of photos **and videos**, driven from `main.js`. Worth knowing:

- **It loops by rotating the DOM, not by cloning or counting.** To advance, the track slides one slot and then its first child is moved to the end with the transition switched off; going back does the reverse (last child moved to the front, jump, then slide). There is therefore no first or last slide to run into, and no index to keep in sync — but it does mean **the DOM order of `.gallery-item` changes as the user browses**, so never rely on it.
- `data-gallery-ready` is set by JS once the carousel is wired. Until then the CSS keeps the arrows hidden and leaves the viewport as a plain horizontal scroller — without JS the arrows would be decoration that does nothing.
- Videos are paused on every slide change; otherwise one would keep playing off-screen.
- Items shown at once: 1 on mobile, 2 from `40em`, 3 from `60em`. With fewer than 4 items the rotation is visible on desktop.
- Content lives in `images/galeria/`, which has its own `LEEME.md` with the markup to copy for a photo or a video. The `demo-*.webp` files are generated placeholders meant to be deleted.

## Drifting seeds in the other sections (`.drift`)

`#servicios` and `#contacto` each open with a `.drift` div holding 14 `.drift-seed` SVGs that reuse the hero's `#dl-seed` symbol and its `.dl-fly*` animation classes. `#sobre-mi` deliberately has none — it is the most image- and text-heavy section and the seeds only added noise there. Things that are easy to get wrong here:

- `#dl-seed` **carries no color of its own** — `stroke`/`currentColor` are inherited from whoever uses it. `.dl-flyers` sets the logo gradient for the hero; `.drift` sets a light lilac; `.section-light .drift` switches to `--accent1` because that section's background is near-white and light seeds would vanish on it. Any new context that `<use>`s the seed must set both `stroke` and `color`.
- `--dur`/`--delay` must sit **on the `.dl-fly` element itself**, not on the wrapping `<svg>`: `.dl-fly` declares its own `--dur: 17s` default, and a declaration on the element beats an inherited one, so vars set on the parent are silently ignored and every seed ends up on the same cycle. `--dur-scale` on `.drift-seed` shortens all of them proportionally (used on mobile) without flattening that variety.
- Seed heights are **stratified** (one per horizontal band), not random — random placement left a third of the section empty, which is very visible on a tall mobile layout.
- Mobile also shortens `--travel` to `72vw`: with the desktop value a seed spent half its cycle already off the right edge, so it looked like it took forever to come back.
- Each seed is positioned in **percentages** with `overflow: visible`, not inside one big SVG with a `viewBox` — a viewBox that has to cover sections of wildly different heights either crops the seeds away (`slice`) or letterboxes them (`meet`). `--travel` is in `vw` so the trip works at any width.
- `.drift` sits at `z-index: 2`, above `.section-inner` — behind the cards the seeds were invisible in card-heavy sections, which defeats the point. Keep the opacity low (~0.34) so they never fight the copy.

## The mobile nav is checkbox-driven, not `<details>`

`#nav-drawer` uses a visually-hidden `<input type="checkbox" id="nav-check">` + `<label for="nav-check">` pair, shown/hidden purely via CSS `:checked` sibling selectors — this is deliberate, not legacy cruft. An earlier `<details>/<summary>` version was replaced because modern Chrome collapses closed `<details>` content via `content-visibility`, which silently breaks CSS attempts to force it visible at the desktop breakpoint. The checkbox pattern has no such quirk and still works with JavaScript fully disabled (`main.js` only adds the *close-on-link-click/outside-click/Escape* convenience on top).

## Notable integrations embedded in `index.html`

- **SEO**: meta description/keywords, canonical URL, Open Graph tags, and a `Physician` JSON-LD structured-data block (name, address, phone, specialty, `openingHoursSpecification`, `review`) — keep all of these in sync if practice details (address, phone, hours) change elsewhere on the page. `sitemap.xml` and `robots.txt` live at the repo root (both served as-is by GitHub Pages, no config needed); bump `<lastmod>` in the sitemap when the page changes meaningfully — it's manual, nothing regenerates it.
- **`llms.txt`** — repo root, plain-text/markdown, follows the llmstxt.org convention (H1 name, one-line blockquote summary, then H2 sections of facts/links). It's the AI-answer-engine counterpart to `sitemap.xml`/`robots.txt`: a clean digest of the practice's facts (specialty, credentials, services + prices, contact, hours, review rating) for LLM-based search/agents to read directly instead of parsing the marketing HTML. Every fact in it must trace back to something already on the page or in the JSON-LD — never add a claim here that isn't stated (and kept in sync) elsewhere on the site.
- The JSON-LD `review` array must stay word-for-word identical to what `#testimonios` shows on the page — Google's structured-data policy requires markup to match visible content. There is deliberately no `aggregateRating`: adding one means asserting a true rating average and total review count for the practice, and guessing at that (rather than pulling it from the real Google Business Profile) is exactly the kind of inaccurate structured data Google's spam policies target. Add it only with real numbers. Also worth knowing: Google's "self-serving reviews" policy means star rich snippets essentially never show for `Review`/`AggregateRating` hosted on the reviewed business's own site regardless of how real the reviews are — the real search-visible rating comes from the actual Business Profile, not this markup. It's still correct to keep the data honest and present.
- **Google Ads conversion tracking**: `gtag_report_conversion()` (defined in an inline `<script>` near the end of `<body>`, intentionally after the content for faster first paint) is wired to `onclick` on every phone/WhatsApp link, reporting to a specific `AW-...` conversion ID. Preserve these handlers when editing those links.
- **Floating action buttons**: phone/WhatsApp buttons (`.float-actions` / `.float-btn`) are fixed-position on mobile only (hidden ≥60em, where the header CTAs take over). Body copy that could scroll under them gets extra right padding (see `.hero-inner > p, .section-inner > p` in `main.css`) — don't remove that without checking text isn't obscured by the buttons at rest.
- **COFEPRIS advertising authorization code** is shown in the footer — this is a Mexican regulatory requirement for medical advertising and must stay accurate/present if renewed or changed.

## Content changes

Do not change prices, cédula numbers, contact details (phone/email/address/hours), or the COFEPRIS line without explicit confirmation — these are regulated/business-critical facts, not copy to edit freely alongside styling work.
