# Delegation Registration Module: status against the Committee's brief

Reply to the Organising Committee's request (16 Nov 2026). The module is built into the existing site; nothing on the public site was redesigned. Public side: `/pt/delegation` (menu item "Inscrição de delegações" plus the header button "Inscrições"). Committee side: the Control Room at `/admin`.

## 1. How it is integrated

- **Same site, same deployment.** Delegation officers sign in at `/pt/delegation/login` (or `/en/...`). The Organising Committee works in the Control Room (`/admin`). Both use the same accounts, database and audit log.
- **Accounts.** There is no public sign-up. A Super admin creates one officer account per country in Control Room > Users (the system refuses a second active officer for the same country). Reviewers get the "Registration reviewer" role.
- **Data.** Records and documents live in Supabase (Postgres + private file storage) once it is connected. Until then the live site runs a read-only demonstration with labelled sample data.

## 2. Requirement by requirement

| # | Requirement | Status | Where |
|---|---|---|---|
| 1 | "Delegation registration" in the site menu | Done | Header button and the "More" menu, PT and EN |
| 1 | Secure account per country, managed by an authorised representative | Done | Users; one active officer per country enforced |
| 1 | Register, edit, submit and monitor participants | Done | Officer dashboard, athlete and official forms |
| 2 | Delegation information (all 10 fields) | Done | Delegation profile; visible to the Committee under Delegations |
| 3 | Athlete form: personal, sporting and additional fields, photograph | Done | Every listed field; discipline is free text until the event list arrives |
| 4 | Coaches and officials (head, coaches, managers, medical, physio, admin/technical, other) | Done | Official form with function, associated sport, photo, contacts |
| 5 | Documents: passport/ID, photo, guardian authorisation, eligibility, medical, other | Done | PDF, JPG, JPEG, PNG up to 8 MB; private storage, opened only through a signed-in link |
| 6 | Delegation dashboard (totals, by sport, incomplete, submitted, approved, corrections) | Done | Officer dashboard |
| 6 | Committee dashboard to review, validate, approve or reject | Done | Dashboard, review queue, record page with automatic checks and decision panel |
| 6 | Statuses Draft → Submitted → Under review → Correction required → Approved / Rejected | Done | A wrong decision can be reopened (with a reason); the registration number is kept |
| 7 | Secure login, role-based permissions | Done | Signed session cookies, lock-out after failed attempts, roles: Super admin, Reviewer, Delegation officer |
| 7 | Automatic validation of mandatory fields | Done | On submit, and re-run for the reviewer |
| 7 | Age eligibility | Done (provisional bands) | Birth-year bands per sport; minors measured on 25 March 2027 |
| 7 | Duplicate prevention | Done | Same passport/ID in the same country is blocked; same number in another country is flagged to the reviewer |
| 7 | Configurable quotas | Done | Control Room > Quotas and documents (men / women / officials / judges per sport) |
| 7 | Bulk athlete registration by Excel template | Done | Template download and import on the officer dashboard |
| 7 | PDF and Excel export | Done | Officer: own country. Committee: any filter (country, sport, status, role, search) |
| 7 | Email notifications (submitted, approved, correction, rejected) | Done, needs a mail account | Resend or a webhook; the Committee inbox is copied on every submission |
| 7 | Portuguese and English | Done | Public pages and Control Room |
| 7 | Mobile and desktop | Done | Phone tab bar and card lists in the Control Room |
| 7 | Data protection, especially minors | Done | Private documents, no indexing, guardian data and file required for under-18s, export footer warning, read-only demo uses fictional data only |
| 7 | Audit records | Done | Activity log: every save, submission and decision, with who and when |
| 8 | Unique registration number on approval | Done | `CPLP27-{COUNTRY}-{0001}` |
| 8 | Data ready for accreditation (photo + QR) | Done | Credential record with photo and QR per approved participant; no re-registration needed |

## 3. Limitations and what we need from the Committee

1. **Database (blocking for real data).** Approve Supabase (or a Committee-hosted Postgres) and its region. Real passports and photos of minors must not be uploaded before this.
2. **Email.** A sending address on the Committee's domain (for Resend) or a webhook, plus the Committee inbox to copy on submissions.
3. **Accounts.** Names and emails of two Super admins, the reviewers, and one officer per country (name, email, phone, institution).
4. **Rules.** Confirm or replace the provisional birth-year bands and quotas (football currently allows no women), the minor cut-off date, which extra documents are compulsory, and the event list per sport.
5. **Accreditation printing.** The data and QR are ready; badge layout and printing hardware are a separate step.
6. **Legal.** A privacy notice for participants and a retention period for documents after the Games.

## 4. Proposed schedule (from receipt of the items above)

| When | What |
|---|---|
| Now | Functional demonstration on the live site (read-only, sample data) |
| Day 1–2 | Connect the database and email; create Super admin and reviewer accounts |
| Day 3 | Load confirmed quotas, documents and event lists; create the nine officer accounts |
| Day 4–5 | Pilot with one or two delegations; fix what they report |
| Day 6 | Open registration to all nine countries |

## 5. Demonstration

Available now at https://jogoscpl2027.vercel.app/admin/login (Committee) and `/pt/delegation/login` (officers), once this change is deployed. The demo shows labelled sample registrations for five countries so the review flow can be walked through; decisions are saved once the database is connected.
