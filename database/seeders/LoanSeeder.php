<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LoanSeeder extends Seeder
{
    public function run(): void
    {
        // get admin user
        $admin = DB::table('users')->where('role', 'admin')->first();

        $loans = [
            [
                'customer_name'  => 'Amit Sharma',
                'mobile'         => '9876543210',
                'address'        => '123 Main Street, Mumbai',
                'loan_amount'    => 50000,
                'emi_amount'     => 5000,
                'tenure_months'  => 12,
                'disbursed_at'   => '2024-01-01',
                'first_emi_date' => '2024-02-01',
                'status'         => 'active',
            ],
            [
                'customer_name'  => 'Priya Singh',
                'mobile'         => '9823456789',
                'address'        => '45 MG Road, Pune',
                'loan_amount'    => 30000,
                'emi_amount'     => 3000,
                'tenure_months'  => 10,
                'disbursed_at'   => '2024-02-01',
                'first_emi_date' => '2024-03-01',
                'status'         => 'active',
            ],
            [
                'customer_name'  => 'Rajan Mehta',
                'mobile'         => '9911223344',
                'address'        => '7 Gandhi Nagar, Jaipur',
                'loan_amount'    => 100000,
                'emi_amount'     => 10000,
                'tenure_months'  => 12,
                'disbursed_at'   => '2024-03-01',
                'first_emi_date' => '2024-04-01',
                'status'         => 'active',
            ],
            [
                'customer_name'  => 'Kavita Yadav',
                'mobile'         => '9833445566',
                'address'        => '45 Civil Lines, Allahabad',
                'loan_amount'    => 25000,
                'emi_amount'     => 2500,
                'tenure_months'  => 10,
                'disbursed_at'   => '2024-04-01',
                'first_emi_date' => '2024-05-01',
                'status'         => 'closed',
            ],
            [
                'customer_name'  => 'Suresh Nair',
                'mobile'         => '9844556677',
                'address'        => '8 Banjara Hills, Hyderabad',
                'loan_amount'    => 75000,
                'emi_amount'     => 7500,
                'tenure_months'  => 12,
                'disbursed_at'   => '2024-05-01',
                'first_emi_date' => '2024-06-01',
                'status'         => 'active',
            ],
            [
                'customer_name'  => 'Deepa Reddy',
                'mobile'         => '9855667788',
                'address'        => '17 Koramangala, Bengaluru',
                'loan_amount'    => 40000,
                'emi_amount'     => 4000,
                'tenure_months'  => 10,
                'disbursed_at'   => '2024-06-01',
                'first_emi_date' => '2024-07-01',
                'status'         => 'defaulted',
            ],
        ];

        foreach ($loans as $loan) {
            DB::table('loans')->insert([
                'uuid'           => Str::uuid(),
                'loan_no'        => 'LN-' . now()->format('Ym') . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT),
                'customer_name'  => $loan['customer_name'],
                'mobile'         => $loan['mobile'],
                'address'        => $loan['address'],
                'loan_amount'    => $loan['loan_amount'],
                'emi_amount'     => $loan['emi_amount'],
                'tenure_months'  => $loan['tenure_months'],
                'disbursed_at'   => $loan['disbursed_at'],
                'first_emi_date' => $loan['first_emi_date'],
                'status'         => $loan['status'],
                'created_by'     => $admin->id,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }

        echo "Loan seeder done. 6 loans created.\n";
    }
}