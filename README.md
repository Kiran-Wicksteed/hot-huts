# Hot Huts

> Booking, payments, and loyalty platform for the Hot Huts floating sauna experience.

## Overview
- Full-stack Laravel 11 + Inertia/React application for managing sauna locations, schedules, bookings, add-on services, and special events.
- Customers complete a multi-step wizard to pick a location, choose extras, find an open time, and pay online through Peach Payments.
- Admins manage locations, saunas, automated schedules, memberships, loyalty rewards, coupons, retail items, and manual bookings in a single dashboard.
- Loyalty, coupon, and membership logic is baked into the checkout flow so rewards can be reserved, redeemed, or reversed automatically as bookings move through their lifecycle.

## Feature Highlights
- **Real-time availability** with auto-generated 15 minute time slots per sauna and optional 5 minute buffer (via `SaunaScheduleObserver`).
- **Multi-item cart checkout** that supports sauna sessions and event occurrences in the same order, holds slots temporarily, and unholds them if payment fails or times out.
- **Peach Payments integration** for hosted checkout, browser redirects, and server-to-server webhooks that reconcile payment status, issue receipts, and send confirmation mail.
- **Loyalty programme** that accrues points per attendee, automatically issues vouchers when balance targets are met, and enforces reservation or redemption of rewards during checkout.
- **Coupons and retail codes** with partial redemption tracking and helper scripts to correct legacy data (`fix-coupon-values.sql`, `generate-coupon`).
- **Membership & approvals** so admins can approve new users, attach or suspend memberships, and adjust loyalty balances.
- **Customer portal** for viewing bookings, rescheduling, monitoring loyalty rewards, applying coupons, and downloading order summaries.
- **Messaging & notifications** via Laravel mailables/notifications for booking confirmations, user approvals, and internal communication.

## Architecture
- **Backend:** PHP 8.2, Laravel 11, Sanctum for session/API auth, database queues, rich Eloquent domain models (`Booking`, `Sauna`, `EventOccurrence`, `Loyalty*`, etc.).
- **Frontend:** Inertia.js + React 18, Tailwind CSS, Headless UI, Heroicons, FullCalendar, CKEditor for rich admin content, bundled by Vite 5.
- **State & tooling:** Ziggy for route helpers, Laravel Pail for log tailing, Laravel Pint for formatting, PHPUnit for automated tests.
- **Payments:** `shaz3e/peach-payment` library customised at install/update time by `scripts/remove-default-payment-method.php`.

## Getting Started

### Prerequisites
- PHP 8.2 or newer with required extensions (`bcmath`, `ctype`, `curl`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo`, `tokenizer`, `xml`).
- Composer 2.6+.
- Node.js 18 LTS (or newer that satisfies Vite 5) and npm.
- A relational database (MySQL or PostgreSQL recommended) and a queue backend (database driver works out of the box).
- Optional: Redis for cache/session (improves hold logic performance).

### Installation
1. Install PHP dependencies:
   ```bash
   composer install
   ```
2. Install JavaScript dependencies:
   ```bash
   npm install
   ```
3. Create your environment file. If the repository does not ship with a `.env.example`, duplicate an existing environment file or request one from the team:
   ```bash
   cp .env.example .env    # adjust if your template file differs
   ```
4. Generate an application key:
   ```bash
   php artisan key:generate
   ```
5. Configure `.env`:
   - `APP_NAME`, `APP_URL`, `APP_ENV`, `APP_DEBUG`
   - Database credentials (`DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`)
   - Queue/cache/session drivers (`QUEUE_CONNECTION=database`, `CACHE_DRIVER`, `SESSION_DRIVER`)
   - Peach Payments credentials (`PEACHPAYMENT_ENTITY_ID`, `PEACHPAYMENT_CLIENT_ID`, `PEACHPAYMENT_CLIENT_SECRET`, `PEACHPAYMENT_MERCHANT_ID`, `PEACHPAYMENT_DOMAIN`, `PEACHPAYMENT_ENVIRONMENT`)
   - Mail driver settings for transactional messages.
   - Optional AWS/S3 credentials if you plan to offload media storage.
6. Prepare the database:
   ```bash
   php artisan migrate
   ```
   Add seeds when you have fixtures available (default seeder is empty).
7. Link public storage for uploaded location/marketing images:
   ```bash
   php artisan storage:link
   ```

### Running the App Locally
- Recommended one-liner (runs HTTP server, queue worker, log tail, and Vite in parallel):
  ```bash
  composer run dev
  ```
- Manual commands if you prefer separate terminals:
  ```bash
  php artisan serve
  php artisan queue:listen --tries=1
  php artisan pail --timeout=0   # optional log tail
  npm run dev
  ```
- The booking flow relies on queue workers to finalise some loyalty actions; keep at least one worker running during development.
- Vite serves Inertia/React pages with hot module reload on http://localhost:5173 by default.

### Frontend Builds
```bash
npm run build   # production assets
```
Laravel Vite plugin will publish hashed assets ready for deployment.

### Payment Webhooks
- Peach Payments posts to `POST /order/callback` and redirects the browser to the same endpoint.
- When developing locally, expose the route with a tunnel (`ngrok http 8000`) and configure the webhook URL in the Peach dashboard.
- Successful webhook processing:
  - Marks related bookings as paid, clears slot holds, and issues loyalty rewards.
  - Redeems reserved vouchers and updates coupon balances.
  - Sends consolidated order confirmation emails.

## Domain Model Overview
- **Location & Sauna Management:** Locations own saunas and image assets; observers generate granular `Timeslot` records per `SaunaSchedule`.
- **Services & Add-ons:** Core sauna sessions plus optional add-ons are priced via `Service` records and surfaced in the booking wizard.
- **Events:** `Event` templates produce scheduled `EventOccurrence` instances that can be booked alongside saunas.
- **Bookings:** Support multi-item carts, hold expiries, payment reconciliation, rescheduling, and cancellation with pro-rated refunds.
- **Loyalty:** `LoyaltyAccount`, `LoyaltyLedger`, and `LoyaltyReward` track points, vouchers, and their lifecycle. Configuration lives in `config/loyalty.php`.
- **Coupons & Retail:** `Coupon` and `RetailItem` models let admins bulk create codes and track partial use.
- **Memberships & Approvals:** Admins approve users, assign memberships, and suspend/reactivate access through dedicated controllers and Inertia screens.

## Tooling & Useful Scripts
- `php artisan test` or `vendor/bin/phpunit` for automated tests.
- `php artisan pint` keeps PHP code style consistent.
- `php artisan schedule:work` (or a system cron running `php artisan schedule:run`) is recommended if you add scheduled jobs.
- `generate-coupon` handy one-liner (run via `php artisan tinker`) for issuing loyalty vouchers during support requests.
- `fix-coupon-values.sql` migration helper for backfilling coupon balances after imports.

## Deployment Checklist
- Build assets: `npm run build`.
- Optimise and cache config/routes/views as needed (`php artisan config:cache`, `php artisan route:cache`).
- Run database migrations during deploy.
- Ensure queue workers (e.g., `php artisan queue:work`) are supervised.
- Configure a scheduler/cron if automated clean-up or nightly routines are introduced.
- Set up webhook endpoints (`/order/callback`) over HTTPS and verify allowed origin matches `PEACHPAYMENT_DOMAIN`.

## Troubleshooting Tips
- Slot availability inconsistencies usually trace back to stalled queue workers or expired holds—check `storage/logs/laravel.log`.
- If Peach Payments declines a transaction, inspect the webhook payload in the logs; the controller logs each decision branch.
- For missing images, confirm the storage symlink exists and `FILESYSTEM_DISK=public` (or S3) is configured.
- A blank Inertia page typically means the Vite dev server is not running; restart `npm run dev`.

---

Maintainers: keep this README up to date as the domain model evolves (notably loyalty, coupons, or membership logic). Add `.env.example` changes whenever new configuration keys are required so onboarding stays painless.
