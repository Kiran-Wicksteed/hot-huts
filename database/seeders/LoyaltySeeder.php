<?php

namespace Database\Seeders;

use App\Models\LoyaltyRewardType;
use Illuminate\Database\Seeder;

class LoyaltySeeder extends Seeder
{
    public function run(): void
    {
        LoyaltyRewardType::firstOrCreate(
            ['name' => 'Free Sauna'],
            ['points_cost' => config('loyalty.points_per_reward', 10), 'payload' => ['covers' => '1-seat'], 'active' => true]
        );
    }
}
