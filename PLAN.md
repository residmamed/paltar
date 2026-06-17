# Paltar — Implementation Plan

Build plan for the clothes classifieds marketplace defined in [CONTEXT.md](CONTEXT.md).
Decisions captured during the grilling session are the source of truth; this plan turns them
into a sequenced build.

## Stack

- **Next.js (App Router) + TypeScript** — one codebase, server-rendered listing/storefront
  pages for SEO/discoverability.
- **PostgreSQL + Prisma** — relational data, migrations.
- **Auth.js (NextAuth)** — email+password and phone-OTP credential providers.
- **Object storage: Cloudflare R2** (S3-compatible) for listing images, served via an image CDN.
- **SMS: provider behind an interface** — a local Azerbaijani SMS gateway in prod (cheaper for
  AZ), stubbed in dev. Abstract it so the provider can change.
- **Payments: Lemon Squeezy** hosted checkout + webhooks — built last, behind a payment
  interface so the rest of the app is payment-agnostic. AZN is display-only (LS charges USD).
- **Search: Postgres full-text + GIN/trigram indexes** for v1; swap in Meilisearch/Typesense
  only if/when scale demands.
- **i18n: next-intl**, single `az` locale. UI strings in Azerbaijani; enums/slugs stay English
  internally.
- **UI: Tailwind + shadcn/ui**, forms with React Hook Form + Zod validation.
- **Hosting: Vercel + managed Postgres (Neon/Supabase) + Cloudflare R2.**

## Cross-cutting rules (apply everywhere)

- **Money** stored in minor units (qəpik) as integers; currency AZN.
- **Authorization**: owners edit only their own listings/storefront; admin-only routes guarded;
  every mutation re-checks ownership server-side.
- **Listing allowance** = count of listings in state `PENDING` or `ACTIVE` for an owner.
  Regular ≤ 5, Store unlimited. Enforced on any transition *into* Pending or Active.
- **Edit re-review**: on listing/branding update, diff the content fields. Price-only change →
  stays live. Any other field → state returns to `PENDING`. Pure state toggles never re-review.
- **Promotion validity** computed at read time (`expiresAt > now`); a nightly job nulls expired
  rows for tidiness but read-time check is authoritative.

## Data model (core entities)

- **User**: id, role (`REGULAR | STORE | ADMIN`), email?, passwordHash?, phone?, phoneVerified,
  createdAt. Identity is email *or* phone.
- **StoreProfile** (1:1 with a Store user): userId, name, slug, logoUrl, bio,
  brandingState (`PENDING | APPROVED | REJECTED`), rejectionReason, createdAt.
- **Listing**: id, ownerId, title, description, department, category, brand, size,
  condition (`NEW | USED`), priceMinor, negotiable, city, contactPhone,
  state (`PENDING | ACTIVE | INACTIVE | SOLD | REJECTED`), rejectionReason,
  createdAt, updatedAt, approvedAt.
- **ListingImage**: listingId, url, position (1–8).
- **Promotion**: listingId, tier (`VIP | DIAMOND`), startsAt, expiresAt, paymentRef.
- **StoreAd** (Top Stores panel): storeUserId, startsAt, expiresAt, paymentRef.
- **Conversation**: listingId, buyerId, sellerId, lastMessageAt.
- **Message**: conversationId, senderId, body, createdAt, readAt.
- **Report**: reporterId, targetType (`LISTING | STORE | USER`), targetId, reason, status.
- **Payment**: userId, kind (`STORE_UPGRADE | PROMOTION | STORE_AD`), amountMinor, currency,
  lemonSqueezyId, status, metadata.

## Phases

Payments are deliberately **last but one** because Lemon Squeezy depends on an external payout
check, and every paid feature can be built and demoed with a "mark as paid" stub first.

### Phase 0 — Foundations
Next.js + TS + Tailwind + shadcn; Prisma + Postgres with initial schema & migrations; next-intl
with `az` locale; base layout (top nav with future inbox slot, footer); R2 client + image-upload
util; CI + Vercel/Neon/R2 deploy.
**Done when:** app boots, DB connected, Azerbaijani shell renders, deploys.

### Phase 1 — Auth & accounts
Email+password signup/login; phone-OTP flow (SMS sender interface, dev stub); User + roles;
sessions; protected routes; account settings.
**Done when:** users register/log in via email or phone.

### Phase 2 — Listings (seller side)
Create/edit form (all fields, Zod validation); image upload (1–8, reorder, primary); state
machine + submit→Pending; allowance enforcement (Pending+Active ≤ 5); edit re-review logic
(price-only exception); seller dashboard with activate/deactivate/mark-sold/delete.
**Done when:** sellers manage listings; new/edited listings land in Pending.

### Phase 3 — Moderation & admin
Admin role + guarded admin panel; listing review queue (approve / reject + reason); reports
model + handling (remove listing, ban user). (Storefront-branding queue wired in Phase 5.)
**Done when:** admin approval moves a listing to Active and it goes public.

### Phase 4 — Discovery (buyer side)
Public listing detail page (gallery, tap-to-call `tel:` link, message button); keyword search
(title+description) + filters (department, category, brand, size, condition, price, city);
sorts — Recommended (default) + Newest/Oldest/Price↑/Price↓; ranking with promotion blocks
(Diamond → VIP → normal; blocks empty until Phase 6); homepage (search, category nav,
placeholders for Top Stores & Diamond carousel, Recommended feed, sell / become-a-store CTAs).
**Done when:** buyers browse, search, filter, and contact sellers by phone.

### Phase 5 — Stores & storefronts
Upgrade-to-Store and register-as-Store (role change; ₼5 stubbed); storefront page (name, logo,
bio, listings; optional Sold-with-badge); branding submit → review (into Phase 3 admin queue);
unlimited allowance for stores.
**Done when:** stores have public, reviewed storefronts.

### Phase 6 — Promotions & monetization mechanics
Promotion (VIP/Diamond) with start/expiry applied to a listing; equal-exposure rotation in
search and the homepage Diamond carousel; Top Stores panel (₼30 / 15 days) with rotation. All
purchases stubbed (mark paid) — mechanics fully working without real money.
**Done when:** promotions and store ads change ranking and the homepage.

### Phase 7 — Chat
Listing-anchored conversations + messages; start-from-listing button; DM inbox in top nav with
unread badges; in-app notifications (realtime via polling first, SSE/websockets later);
block/report from a conversation into the admin queue.
**Done when:** buyers and sellers message in-app.

### Phase 8 — Payments (Lemon Squeezy)
**Gate: confirm AZ payout works before building.** Products/variants for store upgrade,
VIP/Diamond durations, store ad; hosted checkout + webhook → activate the purchased thing;
Payment records with idempotency; AZN display with USD-charge note. Replaces the stubs from
Phases 5–6.
**Done when:** real payments unlock Store, promotions, and the Top Stores slot.

### Phase 9 — Hardening & launch
Rate limiting + spam controls; SEO (metadata, sitemap, listing structured data); performance &
image optimization; search engine upgrade if needed; prohibited-items terms + privacy policy;
analytics; final Azerbaijani copy review; QA.
**Done when:** production-ready.

## Open items to resolve before their phase

- **Lemon Squeezy AZ payout** — verify before Phase 8 (could force a local PSP instead).
- **SMS provider + cost** — choose before Phase 1 prod (local AZ gateway vs Twilio).
- **Promotion price points & durations** — needed for Phase 6/8 (mechanism already decided).
- **Photo cap & storefront fields** — assumed 1–8 photos; confirm storefront extras
  (hours, location, socials) before Phase 5.
- **Azerbaijani taxonomy labels** — confirm the draft Department/Category labels in CONTEXT.md.
