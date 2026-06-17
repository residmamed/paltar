# Equal-exposure rotation for promoted listings and Top Stores

Promoted listings within a tier (VIP, Diamond) and entries in the homepage Top Stores panel
are ordered **randomly on each page load**, not stacked deterministically. We chose this over a
strict ranking (by price paid, recency, etc.) to give every paying seller of the same tier
roughly equal visibility and to avoid bidding wars where one listing permanently occupies the
top slot. This mirrors how tap.az operates its paid services.

## Consequences

- A future engineer's instinct will be a deterministic `ORDER BY` — the randomness is
  intentional and must not be "fixed."
- Tiers still rank against each other deterministically: Diamond block above VIP block above
  normal. Randomization applies only *within* a tier / within the panel.
