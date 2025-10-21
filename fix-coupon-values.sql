-- Fix coupon values that are 100x too large
-- This fixes coupons where values were incorrectly multiplied by 100 twice
-- Run this once to fix existing coupons

UPDATE coupons 
SET 
    original_value_cents = original_value_cents / 100,
    remaining_value_cents = remaining_value_cents / 100
WHERE original_value_cents > 10000; -- Only fix coupons over R100 (likely wrong)

-- Verify the fix
SELECT 
    id,
    code,
    original_value_cents,
    remaining_value_cents,
    original_value_cents / 100 as original_value_rands,
    remaining_value_cents / 100 as remaining_value_rands,
    status,
    expires_at
FROM coupons;
