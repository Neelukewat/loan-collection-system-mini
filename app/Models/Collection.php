<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Collection extends Model
{
    use HasFactory;

    // columns that can be mass assigned
    protected $fillable = [
        'uuid',
        'loan_id',
        'amount_paid',
        'payment_mode',
        'location',
        'transaction_ref',
        'collected_at',
        'collected_by',
        'remarks',
    ];

    // cast columns to correct data types
    protected $casts = [
        'amount_paid'  => 'float',
        'collected_at' => 'datetime',
    ];

    // auto generate uuid when collection is created
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = Str::uuid();
        });
    }

    // collection belongs to a loan
    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    // collection belongs to a user (field agent)
    public function collectedBy()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }
}