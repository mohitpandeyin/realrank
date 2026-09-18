We are close. No more broad research is needed, but I recommend locking a few operational defaults before coding so payment and ownership flows do not need rebuilding later.
Defaults I recommend using
Unless you disagree, I would build with these rules:
1. The submitted phone number becomes the public contact number, with clear consent beside the form.
2. WhatsApp is the default Contact action; owners can change it to Call later.
3. Categories are selected after payment. Until completed, the entity appears under All only.
4. Listings publish after captured payment unless duplicate or abuse checks flag them.
5. Matching entity name + phone opens a top-up flow; matching name with a different phone requires review.
6. Claim #N opens a target-aware listing flow for guests and a top-up flow for authenticated owners.
7. Skipping email OTP does not cancel the listing, but prevents profile management.
8. Email is the only MVP notification channel.
9. No text search until the index has roughly 25–50 genuine entities.
10. Refunds reverse ranking credit. Refunds are limited to technical failure, duplicate payment, RealRank rejection or legal requirements.
Flow wireframe drafts created — 10 September 2026
The four critical screens now have responsive functional drafts that use the locked Terracotta direction and `rr-` class prefix:
- [Payment review, delayed confirmation and failure states](wireframes/realrank-payment-states.html)
- [Payment success and email OTP setup](wireframes/realrank-payment-success-otp.html)
- [Owner dashboard, profile editor, portfolio and ranking top-up](wireframes/realrank-owner-dashboard.html)
- [Public entity profile and portfolio](wireframes/realrank-entity-profile.html)

These are flow and content references rather than a separate visual direction. Razorpay owns the secure payment-method UI; RealRank presents the order review and handles the return, delayed-confirmation and failure states.
An administrator moderation screen can initially be utilitarian rather than visually polished.

Homepage QA lock — 14 September 2026

The Terracotta homepage wireframe has completed its final UX, responsive, accessibility and performance-oriented QA pass. Do not add further homepage sections before implementation. The authoritative interaction, hierarchy, trust, filter, amount-stepper and responsive decisions are recorded under **Homepage final QA lock** in the master product plan.

Multi-city model — 16 September 2026

RealRank uses city-specific public indexes, not state or All India entity rankings. An entity has one shared Rank total and three editable active-city slots (City 1, City 2, City 3). A valid but mistaken initial city does not cancel the paid entity: after account setup, the owner can correct that slot without paying entry again. A fourth simultaneous city requires a separately itemized, one-time purchase of another city slot; the slot can later be reassigned, and its fee never increases Rank total. The extra-slot price remains to be decided before paid expansion launches. See the master product plan for the authoritative rules and data model.

The header city picker now offers **Add a city**, not Coming soon. Its registration dialog mirrors the hero's entity name, contact and Rank Amount fields and adds a searchable canonical city-and-state picker. A recognised city can open publicly with its first valid listing after captured payment and safety checks; it remains `noindex` until useful real supply exists. An unmatched city must be reviewed before checkout. Existing owners use their included or purchased city slots instead of paying a second ₹10 entry. The homepage wireframe demonstrates the popup only; it does not process payments or create production city pages.

Build and launch preparation
Before development:
- Commit and push the latest locked documentation.
- Create a clean environment-variable template without real secrets.
- Prepare representative seed entities and empty/loading/error states.
- Define the database schema and migrations before building UI forms.
- Use Razorpay Test Mode throughout development.
Before accepting real payments:
- Activate Razorpay and complete its required business onboarding.
- Upgrade from Vercel Hobby.
- Configure production SMTP.
- Establish tested PostgreSQL backups.
- Publish Ranking Policy, Terms, Privacy and Refund Policy.
- Confirm GST/invoicing treatment with an Indian accountant.
- Test payment success, delayed webhook, duplicate webhook, failed payment, refund and chargeback flows.
My recommended next move is to checkpoint the documentation, create the four remaining low-fidelity flow wireframes, and then build one complete vertical journey:
Landing → payment → captured webhook → listing published → email OTP → profile editing.
That will validate the hardest part of RealRank before expanding the rest.
