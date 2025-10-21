<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RetailItem;

class RetailItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            [
                'name' => 'Sauna Hat',
                'code' => 'SAUNA_HAT',
                'price_cents' => 65000, // R650.00
                'description' => 'Premium sauna hat for heat protection',
                'is_active' => true,
            ],
            [
                'name' => 'Sauna Honey Tube',
                'code' => 'HONEY_TUBE',
                'price_cents' => 38500, // R385.00
                'description' => 'Natural honey tube for sauna therapy',
                'is_active' => true,
            ],
            [
                'name' => 'Towel Rental',
                'code' => 'TOWEL_RENTAL',
                'price_cents' => 1500, // R15.00
                'description' => 'Clean towel rental',
                'is_active' => true,
            ],
            [
                'name' => 'REVIVE 40\'s',
                'code' => 'REVIVE_40',
                'price_cents' => 58000, // R580.00
                'description' => 'REVIVE supplement - 40 capsules',
                'is_active' => true,
            ],
            [
                'name' => 'REVIVE 30\'s',
                'code' => 'REVIVE_30',
                'price_cents' => 45000, // R450.00
                'description' => 'REVIVE supplement - 30 capsules',
                'is_active' => true,
            ],
        ];

        foreach ($items as $item) {
            RetailItem::updateOrCreate(
                ['code' => $item['code']],
                $item
            );
        }

        $this->command->info('Retail items seeded successfully!');
    }
}
