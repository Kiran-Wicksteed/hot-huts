<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasFactory;

    /** -----------------------------------------------------------------
     *  Mass‑assignable columns
     *  ----------------------------------------------------------------*/
    protected $fillable = [
        'name',
        'description',
        'default_price',     // e.g. store in cents → 45000
        'default_capacity',  // max seats available if no override
        'is_active',
    ];

    /** -----------------------------------------------------------------
     *  Attribute casting
     *  ----------------------------------------------------------------
     *  - default_price: integer if you store cents   (preferred for money)
     *                  OR decimal:2 if the column is DECIMAL(8,2)
     *  - default_capacity: always an integer
     *  - is_active: boolean for easy true/false checks
     */
    protected $casts = [
        'default_price'    => 'integer',   // or 'decimal:2'
        'default_capacity' => 'integer',
        'is_active'        => 'boolean',
    ];

    /** -----------------------------------------------------------------
     *  Relationships
     *  ----------------------------------------------------------------
     *  Each template can spawn many dated occurrences.
     */
    public function occurrences()
    {
        return $this->hasMany(EventOccurrence::class);
    }
}
