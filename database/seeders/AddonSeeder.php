<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Addon;

class AddonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Addon::upsert(
            [
                ['name' => 'Sauna Honey',          'price' => 30.00],
                ['name' => 'REVIVE + Water Combo', 'price' => 40.00],
            ],
            ['name'],          // conflict key → keep names unique
            ['price']          // columns to update if name exists
        );
    }
}
