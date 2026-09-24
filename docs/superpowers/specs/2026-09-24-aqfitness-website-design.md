# Aquam Fitness website: design spec

- **Date:** 2026-09-24
- **Status:** Draft, awaiting review
- **Client:** Alejandro Rivas, Aquam Fitness (aqfitness.ca, Toronto)
- **Builder:** Amir

**Inputs this spec draws on:**
- [old-site/README.md](../../../old-site/README.md): scrape of the old Shopify site (copy, 45 images, FAQs, testimonials, blog)
- [planning/client-questionnaire/answers.md](../../../planning/client-questionnaire/answers.md): Alejandro's questionnaire answers
- [planning/pitch-deck/deck-content.md](../../../planning/pitch-deck/deck-content.md): his corporate pitch deck (program details, research, visual identity)

---

## 1. Goal

Replace the old Shopify site with a fast, static Astro site that sells two things:

1. **Aquam Performance**, a 12-week team fitness and nutrition program for companies (the new growth focus). Its method is called **the Habit Shift**.
2. **1:1 online coaching**, which has two options: training + nutrition, or nutrition only. It's aimed at the existing audience: women over 30 and busy professional moms.

Every page drives toward a **booked call**. No prices are shown anywhere.

### Success criteria
- A company visitor understands what Aquam Performance is within one screen of the home page, and can reach "Book a discovery call" in ≤ 2 clicks from any page.
- An individual visitor reaches 1:1 coaching from the home page in 1 click.
- Lighthouse on mobile scores ≥ 95 for Performance, Accessibility, Best Practices and SEO on Home, Teams, Coaching and a blog post.
- Every old Shopify URL redirects to a sensible new page (no 404s from old links).
- Each third-party integration can be switched from placeholder to real through environment variables or config, without changing code.
- The demo deploy is `noindex` and never competes with the future production site.

## 2. Constraints and locked decisions

| Area | Decision |
|---|---|
| Framework | **Astro 7** (latest; 7.3.x at time of writing), fully static output, no UI-framework islands |
| Hosting | **Netlify.** The demo lives on Amir's Netlify for now and moves to Alejandro's account at launch |
| Contact and lead forms | **Netlify Forms.** Form detection has to be switched on in the Netlify UI (Forms → Enable form detection) |
| Confirmation emails and newsletter | **Resend** (placeholder until Alejandro's account exists) |
| Booking | **Calendly with Zoom** (placeholder links until his account exists) |
| Domain | aqfitness.ca on GoDaddy (Alejandro's). DNS work happens at launch |
| Accounts | Every third-party account belongs to Alejandro. **Only Netlify is used for real during the demo phase** |
| Pricing | Not shown. The site says "pricing on your call" |
| Content editing | Markdown/JSON/YAML files in the repo. No CMS for now |
| Dropped from the old site | Shopify store and merch (JSH is merch only), supplements affiliate page, Instagram reels |
| Kept | Blog (6 migrated posts), before/after gallery, newsletter, free guide (placeholder), About |
| 1:1 audience | Unchanged: women over 30 and busy professional moms ("professional child caregivers… aka Momma bears") |

## 3. Messaging

| | Aquam Performance (companies) | 1:1 Coaching (individuals) |
|---|---|---|
| Buyer | HR / People & Culture, founders and CEOs of smaller companies, team managers, wellness committees | Women over 30 and busy professional moms, online anywhere in Canada |
| Core promise | "Competitive edge starts with your people." Healthier habits lead to more energy, sharper focus, fewer sick days and a stronger team | Stronger, leaner and confident again, without restrictive diets or giving up your social life |
| Proof | Pilots already run (data placeholder), cited research, 200+ clients, 5000+ classes coached, PN + CanFitPro | 29 before/after transformations, 11 written testimonials, Alejandro's own story |
| Tone | **Professional**: confident, data-led, calm | **Friendly**: warm, direct, a little playful (his voice) |
| Primary CTA | Book a discovery call (30 min) | Book a free consult (30 min) |
| Secondary CTA | Contact form (company inquiry) | Free meal-prep guide, newsletter |

The deck's research stats may be used only after they've been checked against their primary sources (see §9.4).

## 4. Information architecture

### 4.1 Sitemap and URLs
URLs describe the offer, not the program name, so they stay stable if "Aquam Performance" gets renamed.

| URL | Page | Side |
|---|---|---|
| `/` | Home: Teams first, with a clear door to 1:1 | Shared |
| `/teams/` | Aquam Performance | Professional |
| `/coaching/` | 1:1 online coaching | Friendly |
| `/results/` | Transformations + testimonials | Friendly |
| `/about/` | Alejandro: story, credentials, mission | Shared |
| `/blog/`, `/blog/[slug]/` | Blog index + 6 migrated posts | Shared |
| `/book/` | The two bookable calls, as two cards | Shared |
| `/free-guide/` → `/free-guide/thanks/` | Lead magnet signup (guide is a placeholder) | Friendly |
| `/contact/` → `/contact/thanks/` | Contact form | Shared |
| `/privacy/`, `/terms/`, `/disclaimer/` | Legal and health disclaimer | Shared |
| `/404` | Not found | Shared |
| `/robots.txt`, `/sitemap-index.xml`, `/llms.txt` | Crawler files | n/a |

### 4.2 Navigation
- **Header:** Logo · For Teams · 1:1 Coaching · Results · About · Blog · **[Book a call]** button. On mobile it collapses into a disclosure menu, so the header uses only a tiny script.
- **Footer:** newsletter signup · free guide link · contact info · Instagram / LinkedIn / Google Business Profile · legal links · © Aquam Fitness.

### 4.3 Redirects (old Shopify URLs → new)
These go in `site/public/_redirects` as 301s:

```
/pages/about-us                 /about/
/pages/testimonials             /results/
/pages/standard-pagenho6z       /coaching/
/pages/contact                  /contact/
/pages/supplemets               /
/blogs/news                     /blog/
/blogs/news/:slug               /blog/:slug/
/collections/*                  /
/products/*                     /
/cart                           /
/account/*                      /
/policies/privacy-policy        /privacy/
/policies/terms-of-service      /terms/
/policies/contact-information   /contact/
/policies/*                     /
```
All 6 blog posts keep their old slugs, so `/blogs/news/:slug` maps 1:1.

## 5. Page specs

The blocks listed for each page come from the named sources. Items marked **[PH]** are placeholders until Alejandro supplies the real content.

### 5.1 Home `/`
1. **Hero (professional):** "Competitive edge starts with your people." Subline: a 12-week team fitness + nutrition program that builds healthier habits, sharper focus and stronger teams. CTAs: **Book a discovery call** and "How it works ↓". A small link: "Looking for 1:1 coaching? →"
2. **Marquee ticker:** EAT. TRAIN. LIVE. (the old brand tagline). CSS-only, and it pauses when the user has reduced motion turned on.
3. **The problem:** 3 verified stats with source links.
4. **Three pillars:** Movement · Nutrition · Recovery (from the deck).
5. **How the 12 weeks work:** a condensed timeline (Foundation 1–4, then the Habit Shift 5–12), linking to `/teams/`.
6. **Proof strip:** pilot result headline **[PH]**, 200+ clients, 5000+ classes, PN / CanFitPro badges.
7. **1:1 door (friendly block, warm background):** "Not here for your team? Train with Alejandro 1:1." Links to `/coaching/`.
8. **Results teaser:** 3 transformations and 1 quote, linking to `/results/`.
9. **Latest posts:** 3 cards.
10. **Final CTA:** full-bleed black & white photo, "Are you ready to compete?", Book a discovery call.

### 5.2 Aquam Performance `/teams/` (source: pitch deck)
1. **Hero:** "Aquam Performance" (eyebrow), "Competitive edge starts with your people." "Not just a wellness initiative. A business strategy." CTA: Book a discovery call.
2. **The problem:** "A sedentary workforce isn't just a wellness problem — it's a performance problem." Verified stats only.
3. **The solution:** three pillars (Movement, Nutrition, Recovery).
4. **Who benefits:** two columns, *For your people* and *For your organization* (from deck slide 5, trimmed).
5. **Program snapshot:** 8+ participants per team (groups over 10 split into two competing teams) · 12 weeks · Monday start with a Friday kickoff · 1:1 + team coaching · "We handle the day-to-day, so HR doesn't take on extra work."
6. **The 12-week curriculum:** a timeline component.
   - Weeks 1–4, **Foundation**: low barrier, learn the app, no leaderboard yet.
   - Weeks 5–12, **the Habit Shift**: the leaderboard opens, habits drive the score, and the weekly focus rotates through nutrition, fitness and recovery.
   - Markers for the kickoff and the 4-weekly team check-ins.
7. **What employees experience:** Trainerize screenshots (from the deck), daily tasks, group chat, weekly check-ins, built-in curriculum. The app is free for employees.
8. **Support structure:** kickoff call (mandatory, 20 min), group chat (ongoing), weekly check-in (under 5 min; confirm this, since the deck says ">5"), team Q&A (optional, 30 min, every 4 weeks).
9. **Measurement:** "What we track" (from the app: workouts, steps, habits, nutrition adherence) and "What you see" (self-reported: performance, productivity, absenteeism, presenteeism). Plus a **sample 4-week report**, built in HTML/CSS/SVG so crawlers can read it, with anonymous team-level numbers and the note "Individual body composition stays private."
10. **Culture driver:** competitive track vs. collaborative track, "You set the culture", and two-team competition.
11. **Evidence:** a table of the verified research rows, each linked to its source.
12. **Pilot results [PH]:** an anonymous case-study card (team size, industry, 12-week outcomes, a quote).
13. **FAQ for HR** (FAQPage schema). Items that need Alejandro to confirm the answer are marked [confirm]:
    - What does HR have to do?
    - How much time does it take employees?
    - Is individual health data shared with the company? (No: team-level reporting only.)
    - Remote or hybrid teams? (Virtual first; in person at offices in the GTA.)
    - Different fitness levels?
    - What does it cost? (Tailored; book a call.)
    - Insurance and certifications? (Liability insured; PN, CanFitPro, First Aid/CPR.)
14. **CTA:** Book a discovery call, with a company-inquiry form as the alternative.

### 5.3 1:1 Coaching `/coaching/` (source: old About + FAQ)
1. **Hero (friendly):** a stronger, leaner, more confident you, without restrictive diets or giving up your social life. CTA: **Book a free consult**.
2. **Who it's for:** busy women over 30 and professional moms (warm copy from the old About).
3. **Two options:** *Online coaching (training + nutrition)* and *Nutrition coaching*, each with what's included and "Pricing shared on your free consult."
4. **How it works:** a real sequence: free consult → your plan → weekly check-ins in Trainerize → adjust and keep going.
5. **Philosophy:** all foods fit, resistance training + movement, "Treat this as something you'll do for the rest of your life, not for three months", and "aggressive patience".
6. **Results teaser + testimonials.**
7. **FAQ** (the old site's 16 FAQs, typos fixed, answers kept in his voice, trimmed to the ones relevant to 1:1).
8. **CTA:** free consult, with the free guide as the softer next step.

### 5.4 Results `/results/`
- A gallery of all 29 transformation photos (from the old testimonials page) and the 11 written quotes. Each quote has a first name **[PH]** until Alejandro maps names to clients.
- Quotes that have a video get a "Watch on Instagram" link-out. The page has no embedded Instagram player.
- A "results not typical" disclaimer.

### 5.5 About `/about/`
Alejandro's story (from the old About, cleaned up):
- From "fat kid at heart" to coach, and the why behind Aquam.
- Credentials from the deck (current): diploma, PN nutrition coach, PN sleep/stress/recovery, certified PT, 200+ clients, 5000+ classes, the Orangetheory stage/top-3 milestones.
- Personal touches (soccer, anime, gamer), the mission, and a headshot **[PH]**.

### 5.6 Blog `/blog/`
- The 6 migrated posts from `old-site/content/blog/`, with typos fixed and original dates kept.
- Post template: title, date, reading time, body, an end-of-post CTA (guide or consult), and BlogPosting schema.
- The index lists posts newest first. Pagination is added only once there are more than 12 posts.

### 5.7 Book `/book/`
- Two cards:
  - **Free consult, 30 min** (for individuals).
  - **Discovery call, 30 min** (for companies).
- Each links to its Calendly URL from config **[PH]**, opening in a new tab. The link is plain, with no Calendly script on the page.
- The 45-minute company call isn't public; Alejandro shares it after the first call.

### 5.8 Free guide `/free-guide/`
- A landing page for a "meal-prep guide" **[PH]**: title, what's inside, and a form (first name, email) posting to Netlify form `free-guide`.
- The thanks page, in placeholder mode, says "Thanks! Your guide is on its way" and doesn't promise a download.

### 5.9 Contact `/contact/`
Netlify form `contact` with these fields:
- name
- email
- phone (optional)
- **interested in** (Aquam Performance for my team / 1:1 coaching / Something else)
- company and team size (shown only when "Aquam Performance" is selected; still in the static HTML so Netlify detects them)
- message
- honeypot (spam trap)

The page also shows the business email **[PH]**, Instagram and the service area. It **does not show the street address** (see §12).

### 5.10 Legal
- `/privacy/`: adapted from the Shopify privacy policy, covering PIPEDA, what the forms collect, Netlify and Resend as processors, and no tracking cookies.
- `/terms/`: trimmed to fit a site with no store.
- `/disclaimer/`: health and results disclaimer.

All three are drafts that Alejandro needs to have reviewed. They are not legal advice.

## 6. Design system

### 6.1 Direction
The goal is STNDRD's confidence (bold condensed headlines, black & white photography, one accent color), split into two moods that share one brand:

- **Performance (professional):** cool paper and ink, square corners, thin rules, data visuals, restrained motion, UPPERCASE condensed headlines.
- **Coaching (friendly):** warm sand backgrounds, 16px rounded corners, real client photos, sentence-case condensed headlines, conversational microcopy.
- **Shared DNA:** the same type families, the same orange accent, the same buttons and the same logo. The AQ logo (outline letterforms) plus the orange accent tie the site to the pitch deck.

### 6.2 Color tokens (contrast checked)

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0E0E0F` | Primary text, dark sections |
| `--charcoal` | `#2B2B2D` | Dark surfaces, cards on ink |
| `--white` | `#FFFFFF` | Base |
| `--paper` | `#F4F3EF` | Performance light background |
| `--sand` | `#EFE9E0` | Coaching light background |
| `--navy` | `#1E2B3A` | Report / data surfaces (deck) |
| `--slate` | `#56667B` | Secondary text and data labels on light backgrounds (≥ 4.86:1 on white, paper and sand) |
| `--body` | `#4A4A4F` | Body text on paper and sand (≥ 7.3:1) |
| `--muted-dark` | `#9A9AA0` | Secondary text on ink (6.9:1) |
| `--accent` | `#E8633A` | Brand orange (deck). Buttons, big display accents, graphics |
| `--accent-ink` | `#B8431D` | Orange for **text or links on light backgrounds** (≥ 4.5:1 on white, paper and sand) |
| `--peach` | `#FBC2AD` | Decorative fills on Coaching only (never behind text that needs contrast) |

**Rules:**
- Primary button: `--accent` background with `--ink` text (5.8:1).
- `--accent` as text only on `--ink`, or at ≥ 24px on white or paper. It is never text on `--sand`.
- Focus ring: a 2px `--accent` outline plus a 2px offset. It passes the 3:1 contrast needed for UI elements on every background.

### 6.3 Typography
Loaded through Astro's built-in `fonts` config, self-hosted in woff2 with Latin subset only.

- **Display: Barlow Condensed** 700/800.
  - Performance headlines are UPPERCASE, tracking −0.5%.
  - Coaching headlines are sentence case.
  - This is the closest free match to STNDRD's condensed Helvetica, and sporty without being a cliché.
- **Body: Barlow** 400/500/600. It pairs naturally with the display face and reads well at 16–18px.
- **Scale** (fluid with `clamp()`): display-xl 56–112px · display-l 40–72 · h2 32–48 · h3 22–28 · body 17–18 · small 14 · eyebrow 13 uppercase, +8% tracking.
- Running text stays at most ~68 characters wide. Headings use `text-wrap: balance`.

### 6.4 Components
All components are `.astro`. JavaScript appears only where marked JS.

| Component | Used on | Notes |
|---|---|---|
| `Header` / `MobileMenu` (JS: toggle) | all | Sticky, compact on scroll (CSS only) |
| `Footer` + `NewsletterForm` | all | Netlify form `newsletter` |
| `Hero` (variants: performance, coaching, simple) | pages | Optional B&W photo with a gradient scrim |
| `Marquee` | home | CSS animation, pauses with reduced motion or on hover |
| `StatBlock` / `StatRow` | home, teams | Value, label, source link (required) |
| `PillarCards` | home, teams | 3 up, stacking on mobile |
| `Timeline12Week` | home (compact), teams (full) | Ordered list, phases, markers |
| `FeatureList` / `TwoColumnBenefits` | teams, coaching | |
| `ReportMock` | teams | HTML/SVG sample report, anonymous |
| `ResearchTable` | teams | Scrolls sideways on its own on narrow screens |
| `CaseStudyCard` [PH] | home, teams | |
| `OptionCards` | coaching | Two offers, no prices |
| `Steps` | coaching | Real sequence, numbered |
| `TransformationGallery` | results, teasers | Sideways scroll-snap rows (no JS), lazy images |
| `TestimonialCard` | results, coaching, home | First name [PH], optional video link-out |
| `FAQ` | teams, coaching | `<details>/<summary>` (no JS) + FAQPage JSON-LD |
| `CTASection` (variants) | all | Book call / consult |
| `BookingCard` | book | Calendly link from config |
| `ContactForm`, `LeadForm` (JS: progressive enhancement) | contact, free-guide | Works without JS (normal POST); with JS, submits via fetch and shows inline success |
| `SEO` (head) | all | Title, description, canonical, OG/Twitter, JSON-LD slot, robots |
| `Placeholder` | demo aid | Visible "[PH]" badge on the demo so Alejandro sees what's missing. With `STRICT_CONTENT=true` (launch), any remaining placeholder fails the build |

### 6.5 Imagery
- **Performance side:** black & white treatment (CSS `filter: grayscale(1)` on the source, or pre-processed) with the orange accent used sparingly.
- **Coaching side:** full-color client photos.
- **Sources:** old-site images (transformations, watermark OK for now), deck image34 (Alejandro in the gym), the deck's white/black logo PNGs, and the Trainerize screenshots used as-is. The one exception is the leaderboard screenshot (`image32`): the file inside the .pptx is unblurred, and the names and faces are hidden only by black boxes drawn on top on the slide. The website copy bakes those boxes into the image.
- **Excluded:** the deck's stock photos (Noun Project credit lines, license unknown).
- **Upgrade later:** his professional headshots and group coaching photos, and a vector logo from Canva.
- **Delivery:** all images go through `astro:assets` (AVIF/WebP, responsive `srcset`, width and height set, lazy loading below the fold).

### 6.6 Motion
Motion is minimal: the marquee, subtle fade/raise on hover for cards and buttons, and the header shrink. Everything respects `prefers-reduced-motion`. Content is never hidden waiting for a scroll trigger.

## 7. Content model (Markdown / data in the repo)

```
site/src/
  content.config.ts        # Astro collections (glob/file loaders + zod schemas)
  content/
    blog/*.md              # title, description, pubDate, updatedDate?, author, image?, draft
    testimonials.yaml      # id, firstName [PH], quote?, image, videoUrl?, side (coaching|performance), featured
    faq-teams.yaml         # question, answer (md), confirm: bool
    faq-coaching.yaml
    stats.yaml             # value, label, sourceTitle, sourceUrl, year, verified: bool
    research.yaml          # source, scope, finding, url, verified: bool
  config/
    site.ts                # name, tagline, URLs, nav, socials, email [PH], serviceArea,
                           # calendly.{consult,discovery} [PH], feature flags
```
- The copy for main pages lives in the page files (`src/pages/*.astro`). Anything repeating or likely to be edited (posts, testimonials, FAQs, stats, research, contact details, links) lives in the data files above.
- A stat or research row with `verified: false` shows a visible warning on the demo, and fails the build when `STRICT_CONTENT=true` (set at launch). This keeps unchecked claims off the live site.

## 8. Integrations and the placeholder strategy

| Integration | Demo (now) | Launch (Alejandro's accounts) |
|---|---|---|
| Netlify hosting | Amir's Netlify, `*.netlify.app`, `noindex` | Transfer the site to Alejandro's Netlify team |
| Netlify Forms (`contact`, `free-guide`, `newsletter`) | Real (submissions visible in Amir's Netlify) | Same, on his account. Turn on email notifications to him |
| Emails via Resend | `netlify/functions/submission-created` runs on every verified submission. **With no `RESEND_API_KEY`, it logs the email it would have sent and exits OK** | Set `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_OWNER`, and `RESEND_SEGMENT_ID` (a Resend segment for newsletter contacts) |
| Newsletter list | The same function logs "would add to audience" | Resend audience from the same env vars. Broadcasts are sent from the Resend dashboard |
| Free guide | The thanks page says it's on its way, and the function logs | Upload the PDF, set `GUIDE_URL`, and the confirmation email includes it |
| Calendly | `site.ts` → `calendly.consult` / `calendly.discovery` left empty. The buttons go to `/book/`, which shows a "Booking opens soon" [PH] note | Paste his two Calendly event URLs (Calendly with Zoom: he connects Zoom inside Calendly) |
| Domain / DNS | none | GoDaddy: point aqfitness.ca to Netlify, add Resend SPF/DKIM records, set `SITE_URL` |
| Google Business Profile / LinkedIn | `[PH]` URLs in `site.ts` (left out of `sameAs` until real) | Real URLs |
| Analytics | none | Decide at launch; a privacy-friendly option means no cookie banner |

**Email content** (templates live in code, plain and branded):
- *Contact:* confirmation to the sender, plus a notification to Alejandro with all fields.
- *Company inquiry:* the same, and the confirmation links to the discovery-call booking page.
- *Free guide:* a welcome email with the guide link (placeholder text until the guide exists).
- *Newsletter:* a short welcome.

The go-live checklist (§13) turns this table into steps.

## 9. SEO and AI discoverability

### 9.1 On-page basics
- A unique title (≤ 60 chars) and description (≤ 155 chars) on every page.
- A canonical URL built from `SITE_URL`.
- Open Graph and Twitter cards: 3 static OG images (Performance, Coaching, default).
- One H1 per page and semantic landmarks.
- Crawlable HTML for everything important: the report mock, the timeline and the FAQs are real HTML, not images.

### 9.2 Structured data (JSON-LD)
- **Site-wide:** `Organization` (Aquam Fitness, logo, `sameAs` socials) + `WebSite`.
- **`/teams/`:** `Service` (Aquam Performance, `provider` Organization, `areaServed` GTA in person and Canada virtual) + `FAQPage`.
- **`/coaching/`:** `Service` (online coaching, `areaServed` Canada) + `FAQPage`.
- **`/about/`:** `Person` (Alejandro Rivas, `jobTitle`, `hasCredential`, `worksFor`).
- **Posts:** `BlogPosting`. **All inner pages:** `BreadcrumbList`.
- **No `LocalBusiness` with a street address** until the address question is settled (§12).

### 9.3 Crawler files
- **`robots.txt`:**
  - Production allows everything, AI crawlers included (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended), and points to the sitemap.
  - Unless `ALLOW_INDEXING=true` **and** Netlify's `CONTEXT` is `production`, the build emits `Disallow: /`, `<meta name="robots" content="noindex">` and an `X-Robots-Tag: noindex` header. The demo deploys from `main` (Netlify's "production" context), so an explicit flag is needed; context alone can't tell the demo from the live site.
- **`@astrojs/sitemap`**, with legal pages at low priority.
- **`/llms.txt`**, generated at build: a plain summary of who Aquam Fitness is, both offers, the service area, credentials, and links to the key pages and posts.

### 9.4 Claims
- Every stat or research figure shown links to its primary source.
- The deck's stats are checked during the build phase, and any that can't be verified are removed. Specifically flagged:
  - "70% lower cognitive performance (Stanford 2023)"
  - The framing of the RAND 2014 ROI figure
  - The "25–30% absenteeism" attribution
- Health and results disclaimers are linked from the footer, the Results page and the Coaching page.

## 10. Performance and accessibility budgets
- **JavaScript:** no framework runtime, and under 10 KB of our own JS in total (mobile menu, form enhancement, contact-form conditional fields).
- **Images:** the LCP image preloaded, AVIF/WebP, never above 250 KB for a hero at 1440w.
- **Fonts:** 2 families, woff2, Latin only, `font-display: swap`, with metric-matched fallbacks from Astro fonts.
- **Accessibility:** WCAG 2.2 AA.
  - A skip link and visible focus states.
  - Label and error text on every form field.
  - `<details>` for the FAQs, and a reduced-motion alternative for all motion.
  - Color contrast per §6.2, and a real ordered list for the timeline.

## 11. Technical architecture

```
repo root
├─ netlify.toml           # base = "site", build = "npm run build", publish = "dist",
│                         # [functions] directory = "netlify/functions", context headers (noindex)
├─ site/                  # the Astro project
│  ├─ astro.config.mjs    # site: SITE_URL, fonts, sitemap integration
│  ├─ src/{pages,layouts,components,content,config,styles,assets,lib}
│  ├─ public/             # _redirects, favicon, og images
│  ├─ src/pages/robots.txt.ts, llms.txt.ts   # generated at build; robots depends on ALLOW_INDEXING + CONTEXT
│  ├─ scripts/postbuild.mjs                  # writes dist/_headers (X-Robots-Tag when not indexable)
│  └─ netlify/functions/submission-created.mts   # uses lib/email.ts (Resend or log)
├─ docs/                  # specs, plans
├─ planning/  old-site/  material/   # reference only, git-ignored (repo is public)
```
- **Styling:** plain CSS. Tokens live in `styles/tokens.css`, a small `global.css` holds the base styles, and components use Astro's scoped `<style>`. No Tailwind, so there are fewer dependencies and nothing extra for Alejandro's future developer to learn.
- **Environment variables:** `SITE_URL`, `ALLOW_INDEXING`, `STRICT_CONTENT`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_OWNER`, `RESEND_SEGMENT_ID`, `GUIDE_URL`. All are optional; placeholder mode is whatever happens when a variable is missing. `CONTEXT` is set by Netlify.
- **Node:** 24 LTS (Astro 7 needs ≥ 22.12), pinned in `.nvmrc` and in the Netlify environment.

## 12. Open items

| # | Item | Owner | Blocks the demo? |
|---|---|---|---|
| 1 | Pilot results (numbers, team size, industry, quote) | Alejandro | No, [PH] |
| 2 | First names mapped to testimonials | Alejandro | No, [PH] |
| 3 | Headshots and group coaching photos | Alejandro | No, old images meanwhile |
| 4 | Vector logo (Canva) | Amir, from Canva access | No, PNG meanwhile |
| 5 | Meal-prep guide PDF | Alejandro | No, [PH] |
| 6 | Accounts: Calendly (+ Zoom), Resend, business email, GBP link, LinkedIn business page | Amir + Alejandro | No |
| 7 | **Publish a street address?** The old site listed a home street address, and in-person work is only at client offices. Recommendation: show the service area only | Alejandro | No |
| 8 | Confirm the check-in length (deck says ">5 min") and the HR FAQ answers marked [confirm] | Alejandro | No |
| 9 | Stats verification (§9.4) | Amir (during the build) | No |
| 10 | Legal review of the privacy, terms and disclaimer drafts | Alejandro | No |
| 11 | Analytics choice | Amir + Alejandro | No |
| 12 | Repo is public: client material (`material/`, `planning/`, `old-site/`) is git-ignored. Only site code, the assets the site ships and `docs/` are committed | Amir | Resolved |

## 13. Go-live checklist (for later)
1. Create Alejandro's accounts: Netlify team, Resend, Calendly (connect Zoom), business email.
2. Transfer the Netlify site to his team and set the env vars (§11).
3. At GoDaddy: point the domain to Netlify, add the Resend DNS records and verify the domain.
4. Replace the `site.ts` placeholders: Calendly URLs, email, GBP, LinkedIn.
5. Set `SITE_URL` to https://aqfitness.ca, `ALLOW_INDEXING=true` and `STRICT_CONTENT=true`, fix anything the strict build flags, and confirm production `robots.txt` and the indexing headers.
6. Submit a test to each form and confirm the emails arrive. Turn on Netlify form notifications to him.
7. Submit the sitemap in Google Search Console (his account) and update the Google Business Profile website link.
8. Once DNS has moved, cancel the Shopify plan (export anything needed first).

## 14. Out of scope for v1
- Prices
- A CMS editing interface
- Online checkout, the merch store, the supplements page
- Instagram feed or reels
- Multi-language
- Site search
- Analytics (decided at launch)
- Blog pagination (until there are more than 12 posts)
- Dynamic OG images

## 15. Testing and verification
- `astro check` passes, and the build passes. With `STRICT_CONTENT=true`, the build fails on unverified stats or leftover placeholders (§7).
- A link check across the built site covers internal links and every redirect in `_redirects`.
- An automated accessibility check (axe, via Playwright) on Home, Teams, Coaching, Results, Contact and one blog post finds no serious or critical violations.
- Lighthouse on mobile scores ≥ 95 across all 4 categories on the key pages (§1).
- JSON-LD is valid (Schema.org validator) on Teams, Coaching, About and one post.
- Forms, on a Netlify deploy preview:
  - Each form appears under Forms.
  - A test submission succeeds, with JS on and with JS off.
  - The function log shows the placeholder email.
- The demo returns `noindex` (header + robots) and production settings produce indexable output.
