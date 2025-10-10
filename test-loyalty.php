<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Get the latest booking
$booking = \App\Models\Booking::latest()->first();

echo "Latest Booking:\n";
echo "ID: {$booking->id}\n";
echo "User ID: {$booking->user_id}\n";
echo "Status: {$booking->status}\n";
echo "People: {$booking->people}\n";
echo "Created: {$booking->created_at}\n\n";

// Check if loyalty points exist for this booking
$ledger = \App\Models\LoyaltyLedger::where('source_type', 'Booking')
    ->where('source_id', $booking->id)
    ->get();

echo "Loyalty Ledger Entries: " . $ledger->count() . "\n";
foreach ($ledger as $entry) {
    echo "  - Type: {$entry->type}, Points: {$entry->points}\n";
}

// Try to manually accrue points
echo "\nAttempting to manually accrue points...\n";
$service = app(\App\Services\LoyaltyService::class);
try {
    $service->accrueFromBooking($booking);
    echo "Success!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

// Check again
$ledger = \App\Models\LoyaltyLedger::where('source_type', 'Booking')
    ->where('source_id', $booking->id)
    ->get();

echo "\nLoyalty Ledger Entries After: " . $ledger->count() . "\n";
