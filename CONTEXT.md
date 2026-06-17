# Paltar

A web marketplace for buying and selling second-hand clothes as classified listings.
There is no online checkout, payment for goods, or shipping — the platform only hosts
listings and connects sellers to interested buyers. The platform's own revenue comes from
seller-side paid features (storefronts, listing promotions, homepage advertising).

The user-facing language is **Azerbaijani**. Glossary terms below are written in English for
the team; Azerbaijani UI labels (shown in parentheses) are a first-pass draft to be confirmed
by a native speaker.

## Language

**User**:
Anyone with a registered account on the platform. Every account can create and edit listings.
_Avoid_: Account, member

**Regular user**:
The default account type. A single account that is both buyer and seller: it can browse and
contact sellers, and it can post a small number of individual listings (discoverable only
through search and browse). Has no branded public page.
_Avoid_: Normal user, casual seller

**Buyer**:
Not an account type. "Buying" is simply what any User does when browsing and contacting
sellers — every account (Regular user or Store) can do it. Avoid modelling a separate buyer
account.
_Avoid_: Customer, shopper (as an account type)

**Store**:
A paid role on a User's account, obtained either by upgrading a Regular user or by registering
as a Store directly. Grants a branded, publicly-linkable storefront page and a higher listing
allowance. A Store is not a separate kind of account — it is a capability unlocked on a User.
_Avoid_: Shop, vendor, seller

**Storefront**:
The public page belonging to a Store, showing the Store's name, profile/branding, and all of
its listings together under one brand.
_Avoid_: Store page, profile

**Listing**:
A single item of clothing offered for sale by a User. Any User can create, edit, delete,
activate, deactivate, or mark sold their own listings at any time.
_Avoid_: Post, ad, item

**Listing state** (Pending / Active / Inactive / Sold / Rejected):
A Listing is always in exactly one state. Every new listing is reviewed by an Admin before it
becomes public.
- **Pending** (AZ: Yoxlanılır): submitted, awaiting Admin review; not public.
- **Active**: approved and publicly discoverable; counts toward the owner's listing allowance.
- **Inactive**: hidden by the owner, may be brought back; does not count toward the allowance.
- **Sold**: the item sold; hidden from public search/browse and does not count toward the
  allowance, but kept in the owner's own history. A Store may optionally display its Sold items
  on its Storefront with a "SOLD" badge as social proof; Regular users' Sold items stay hidden.
- **Rejected** (AZ: Rədd edilib): Admin declined it (with a reason); not public. The owner can
  edit and resubmit, returning it to Pending.

Inactive vs Sold differ in meaning, not public visibility (both are hidden): Inactive = "hiding
for now," Sold = "it's gone." Users move listings freely between Active/Inactive/Sold.
_Avoid_: Published/unpublished, enabled/disabled, expired

**Admin**:
An internal platform operator (not a public account type). Reviews and approves or rejects
Pending listings before they go public, handles reports, and can remove listings or ban
accounts via an admin panel.
_Avoid_: Moderator, staff

**Listing allowance**:
The maximum number of in-pipeline listings a User may have at once, counting **Pending +
Active** together. Regular users: 5. Stores: unlimited. Inactive, Sold, and Rejected listings
do not count. Deactivating, selling, or deleting a listing frees a slot.

**Chat**:
In-platform messaging that lets a logged-in User contact a seller. A conversation is started
from a button on a Listing and is anchored to that listing (the seller sees which item it's
about). Conversations are async and persist in a per-user DM inbox reachable from the top nav.
Requires login on both sides.
_Avoid_: Message, group chat

**Phone number**:
A contact number a seller publishes so people can reach them off-platform. Entered per listing
and shown publicly on that listing (no login required to see it). Tapping it opens the device's
phone dialer to call the seller directly.

**Condition**:
Whether a listed item is New or Used. (Only these two values.)
_Avoid_: State, quality

**Department** (AZ: draft labels below):
The top level of the clothes taxonomy, by who the item is for. Values: Men (Kişi),
Women (Qadın), Kids (Uşaq), Unisex (Uniseks). Every Listing has exactly one Department.
_Avoid_: Gender, section

**Category** (AZ: draft labels below):
The second level of the taxonomy — the item type. Draft values: Outerwear (Gödəkçə və
paltolar), Tops (Üst geyim), Bottoms (Şalvar və ətəklər), Dresses (Donlar), Footwear
(Ayaqqabılar), Accessories (Aksesuarlar), Activewear (İdman geyimləri), Other (Digər).
Every Listing has exactly one Category under its Department.
_Avoid_: Type, kind, subcategory

**Promotion**:
A time-limited paid boost applied to a single Listing that lifts it above normal listings in
search and browse results. Available to any User. Modelled on tap.az's paid services.
_Avoid_: Boost, ad (for a listing)

**VIP**:
The mid promotion tier. A VIP listing appears in the VIP block above normal listings in
search/browse results. No homepage placement.
_Avoid_: Premium, featured

**Diamond**:
The top promotion tier, above VIP. A Diamond listing appears in the Diamond block above VIP and
normal listings in search/browse, **and** is featured in the homepage Diamond carousel. The
homepage exposure is the concrete benefit that distinguishes Diamond from VIP.
_Avoid_: Platinum, gold

**Recommended** (default sort):
The default ordering of search/browse results. Promoted blocks first (Diamond, then VIP, each
under equal-exposure rotation), then normal listings scored by a v1 heuristic blend of recency
and completeness (more photos / fully-filled fields rank higher). Popularity signals (views,
clicks, speed of sale) are folded in later once usage data exists. Other selectable sorts
(Newest, Oldest, Price low→high, Price high→low) reorder only the normal block.
_Avoid_: Relevance, best match, featured

**Equal-exposure rotation**:
Within a single promotion tier (and within the Top Stores panel), entries are ordered randomly
on each page load rather than stacked permanently, so every paid entry of the same tier gets
roughly equal visibility.

**Top Stores panel**:
A homepage panel showing up to ten Stores. A Store-only paid placement (₼30 for 15 days).
Each entry links to the Store's Storefront. Subject to equal-exposure rotation when more than
ten Stores are paying.
_Avoid_: Featured stores, sponsored
