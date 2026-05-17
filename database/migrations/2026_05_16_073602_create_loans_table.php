<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('loan_no', 20)->unique();
            $table->string('customer_name', 150);
            $table->string('mobile', 15);
            $table->text('address');
            $table->decimal('loan_amount', 12, 2);
            $table->decimal('emi_amount', 10, 2);
            $table->integer('tenure_months');
            $table->date('disbursed_at');
            $table->date('first_emi_date');
            $table->enum('status', ['active', 'closed', 'defaulted'])->default('active');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
