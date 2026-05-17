<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CollectionSeeder extends Seeder
{
    public function run(): void
    {
        // get first loan id
        $loan = DB::table('loans')->first();
        $user = DB::table('users')->first();

        if (!$loan) {
            echo "No loans found. Please create a loan first.\n";
            return;
        }

        // collection data spread across different hours
        // morning 9-11 AM has most collections (should be predicted as best slot)
        $data = [
            ['hour' => 9,  'days' => 1,  'amount' => 5000, 'mode' => 'cash'],
            ['hour' => 9,  'days' => 3,  'amount' => 3000, 'mode' => 'upi'],
            ['hour' => 9,  'days' => 5,  'amount' => 4000, 'mode' => 'cash'],
            ['hour' => 10, 'days' => 7,  'amount' => 5000, 'mode' => 'card'],
            ['hour' => 10, 'days' => 9,  'amount' => 6000, 'mode' => 'cash'],
            ['hour' => 10, 'days' => 11, 'amount' => 3000, 'mode' => 'upi'],
            ['hour' => 11, 'days' => 13, 'amount' => 4000, 'mode' => 'cash'],
            ['hour' => 11, 'days' => 15, 'amount' => 5000, 'mode' => 'upi'],
            ['hour' => 14, 'days' => 17, 'amount' => 3000, 'mode' => 'cash'],
            ['hour' => 14, 'days' => 19, 'amount' => 2000, 'mode' => 'card'],
            ['hour' => 15, 'days' => 21, 'amount' => 3000, 'mode' => 'upi'],
            ['hour' => 17, 'days' => 23, 'amount' => 2000, 'mode' => 'cash'],
            ['hour' => 18, 'days' => 25, 'amount' => 1000, 'mode' => 'cash'],
        ];

        foreach ($data as $d) {
            DB::table('collections')->insert([
                'uuid'         => Str::uuid(),
                'loan_id'      => $loan->id,
                'amount_paid'  => $d['amount'],
                'payment_mode' => $d['mode'],
                'collected_at' => now()->subDays($d['days'])->setHour($d['hour']),
                'collected_by' => $user->id,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }

        echo "Collection seeder done.\n";
    }
}