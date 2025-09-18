<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoyaltyLedger extends Model
{
    protected $table = 'loyalty_ledger';
    protected $fillable = ['account_id', 'type', 'points', 'source_type', 'source_id', 'notes', 'meta', 'occurred_at'];
    protected $casts = ['meta' => 'array', 'occurred_at' => 'datetime'];

    public const TYPE_EARN     = 'earn';
    public const TYPE_CONVERT  = 'convert'; // points -> voucher
    public const TYPE_REDEEM   = 'redeem';  // voucher used (0 pts)
    public const TYPE_ADJUST   = 'adjust';
    public const TYPE_REVERSAL = 'reversal';

    public function account(): BelongsTo
    {
        return $this->belongsTo(LoyaltyAccount::class, 'account_id');
    }
}
