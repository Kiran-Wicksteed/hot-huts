# Booking Cancellation System with Refund Coupons

## Overview
This system allows users to cancel their bookings with automatic refund calculation based on time until the session. Refunds are issued as reusable coupons that support partial redemption.

## Cancellation Policy

### Time-Based Refund Tiers
1. **More than 24 hours before session**
   - Full refund (100%)
   - Reschedule permitted

2. **Between 4-24 hours before session**
   - 50% refund
   - Reschedule permitted

3. **Less than 4 hours before session**
   - No refund (0%)
   - No reschedule permitted
   - Cancellation still allowed (forfeit)

## Database Schema

### New Tables

#### `coupons`
- `id` - Primary key
- `code` - Unique coupon code (e.g., REFUND-ABCD-EFGH)
- `user_id` - Owner of the coupon
- `source_booking_id` - Original booking that generated this coupon
- `type` - Type: refund, promotional, loyalty
- `original_value_cents` - Original value in cents
- `remaining_value_cents` - Remaining balance in cents
- `expires_at` - Expiration date (6 months from issue)
- `status` - active, fully_redeemed, expired, cancelled
- `notes` - Additional information

#### `coupon_redemptions`
- `id` - Primary key
- `coupon_id` - Reference to coupon
- `booking_id` - Booking where coupon was used
- `amount_cents` - Amount redeemed in this transaction

### Updated Tables

#### `bookings` (new fields)
- `cancelled_at` - Timestamp of cancellation
- `cancelled_by` - User who cancelled (FK to users)
- `cancellation_reason` - Reason for cancellation
- `refund_amount_cents` - Refund amount issued
- `refund_type` - none, full, partial, coupon

## Backend Components

### Models

#### `Coupon` (`app/Models/Coupon.php`)
- Handles coupon validation and partial redemption
- Methods:
  - `isValid()` - Check if coupon can be used
  - `redeem($amountCents, $bookingId)` - Redeem partial or full amount
  - `generateUniqueCode()` - Create unique coupon codes

#### `CouponRedemption` (`app/Models/CouponRedemption.php`)
- Tracks individual redemption transactions
- Links coupons to bookings

### Services

#### `CancellationService` (`app/Services/CancellationService.php`)
- Core business logic for cancellations
- Methods:
  - `calculateRefund($booking)` - Determine refund based on policy
  - `cancelBooking($booking, $userId, $reason)` - Process cancellation
  - `getCancellationPreview($booking)` - Preview without cancelling

### Controllers

#### `BookingCancellationController` (`app/Http/Controllers/BookingCancellationController.php`)
- `preview($booking)` - GET cancellation preview
- `cancel($booking)` - POST to cancel booking
- `adminCancel($booking)` - Admin override with custom refund

#### `CouponController` (`app/Http/Controllers/CouponController.php`)
- `apply($request)` - Apply coupon to cart
- `remove($request)` - Remove coupon from cart
- `validate($request)` - AJAX validation
- `index()` - List user's coupons

### Email

#### `BookingCancelledMail` (`app/Mail/BookingCancelledMail.php`)
- Sends cancellation confirmation
- Includes coupon code if refund issued
- Template: `resources/views/emails/booking-cancelled.blade.php`

## Frontend Components

### React Components

#### `CancelBookingModal` (`resources/js/Components/CancelBookingModal.jsx`)
- Modal dialog for cancellation
- Shows refund preview
- Displays policy information
- Optional reason input

#### Updated: `ContentSection` (`resources/js/Components/my-bookings/ContentSection.jsx`)
- Added "Cancel Booking" button to upcoming bookings
- Integrated cancellation modal

#### Updated: `InvoiceDetails` (`resources/js/Components/booking-form/InvoiceDetails.jsx`)
- Updated to use new coupon system (routes changed from loyalty to coupons)
- Supports partial coupon redemption

## Routes

### User Routes
```php
// Cancellation
GET  /bookings/{booking}/cancel/preview  - Preview cancellation
POST /bookings/{booking}/cancel          - Cancel booking

// Coupons
POST   /coupons/apply     - Apply coupon to cart
DELETE /coupons/remove    - Remove coupon from cart
POST   /coupons/validate  - Validate coupon code
GET    /coupons           - List user's coupons
```

### Admin Routes
```php
POST /admin/bookings/{booking}/cancel - Admin cancel with override
```

## Integration Points

### BookingController Updates
- Coupon redemption integrated into checkout flow
- Supports partial redemption
- Handles zero-amount bookings (fully covered by coupon)

### PaymentController Updates
- Webhook handler redeems coupons after successful payment
- Prevents double redemption

## Usage Flow

### User Cancellation Flow
1. User clicks "Cancel Booking" on dashboard
2. System fetches cancellation preview via API
3. Modal shows refund amount and policy
4. User confirms cancellation
5. Backend:
   - Marks booking as cancelled
   - Calculates refund based on time
   - Creates coupon if refund > 0
   - Reverses loyalty points
   - Sends email with coupon code
6. User receives email with coupon code

### Coupon Redemption Flow
1. User enters coupon code at checkout
2. System validates coupon
3. Coupon value applied to cart total
4. If total > coupon value: partial redemption, pay difference
5. If total <= coupon value: full redemption, save remainder
6. After payment: coupon balance updated
7. Coupon remains active if balance > 0

## Coupon Features

### Partial Redemption
- Coupons can be used multiple times
- Each use deducts from remaining balance
- Automatically marked as `fully_redeemed` when balance = 0

### Expiration
- Coupons expire 6 months after issue
- Expired coupons cannot be redeemed
- Status automatically updated

### Security
- User-specific (can't share codes)
- Unique codes prevent guessing
- Validated on every use

## Admin Features

### Custom Cancellation
Admins can cancel bookings with:
- Custom refund percentage (0-100%)
- Force no refund option
- Custom cancellation reason

## Migration Steps

1. Run migrations:
```bash
php artisan migrate
```

2. Migrations will create:
   - `coupons` table
   - `coupon_redemptions` table
   - Add cancellation fields to `bookings` table

## Testing Checklist

- [ ] Cancel booking >24 hours - verify 100% refund coupon
- [ ] Cancel booking 4-24 hours - verify 50% refund coupon
- [ ] Cancel booking <4 hours - verify no refund
- [ ] Apply coupon at checkout - verify discount
- [ ] Partial coupon use - verify remaining balance saved
- [ ] Full coupon use - verify status updated
- [ ] Coupon expiration - verify cannot use expired
- [ ] Email notification - verify coupon code included
- [ ] Admin override - verify custom refund amounts
- [ ] Loyalty point reversal - verify points deducted

## Configuration

### Coupon Expiration
Default: 6 months
Location: `CancellationService::cancelBooking()` line 82

### Cancellation Policy Hours
- 24 hours threshold: `CancellationService::calculateRefund()` line 41
- 4 hours threshold: `CancellationService::calculateRefund()` line 35

## Notes

- Cancelled bookings free up capacity immediately
- Loyalty points are reversed on cancellation
- Loyalty rewards redeemed for booking are restored
- Coupons are user-specific and cannot be transferred
- System prevents session-started bookings from being cancelled
