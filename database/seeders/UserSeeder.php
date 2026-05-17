<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**

     * Run the database seeds.

     */
    public function run(): void
    {
        User::create([
            'name'      => 'Admin User',
            'email'     => 'admin@loanapp.com',
            'password'  => Hash::make('Admin@1234'),
            'role'      => 'admin',
            'phone'     => '9900000001',
            'is_active' => true,
        ]);

        User::create([
            'name'      => 'Ravi Kumar',
            'email'     => 'ravi@loanapp.com',
            'password'  => Hash::make('Agent@1234'),
            'role'      => 'field_agent',
            'phone'     => '9900000002',
            'is_active' => true,
        ]);
    }
}
