<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Loan extends Model
{
    use HasFactory;

    // columns that can be mass assigned
    protected $fillable = [
        'uuid',
        'loan_no',
        'customer_name',
        'mobile',
        'address',
        'loan_amount',
        'emi_amount',
        'tenure_months',
        'disbursed_at',
        'first_emi_date',
        'status',
        'notes',
        'created_by',
    ];

    // cast columns to correct data types
    protected $casts = [
        'loan_amount'    => 'float',
        'emi_amount'     => 'float',
        'disbursed_at'   => 'date',
        'first_emi_date' => 'date',
    ];

    // auto generate uuid when a new loan is created
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = Str::uuid();
        });
    }

    // one loan has many collections
    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    // search by customer name, loan number or mobile
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('customer_name', 'like', "%{$term}%")
              ->orWhere('loan_no', 'like', "%{$term}%")
              ->orWhere('mobile', 'like', "%{$term}%");
        });
    }
}