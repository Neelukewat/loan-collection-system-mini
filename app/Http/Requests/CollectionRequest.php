<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CollectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // force validation errors to always return JSON
    protected function failedValidation(Validator $validator): never
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }

    public function rules(): array
    {
        return [
            'loan_id'         => ['required', 'exists:loans,id'],
            'amount_paid'     => ['required', 'numeric', 'min:1'],
            'payment_mode'    => ['required', 'in:cash,upi,card'],
            'location'        => ['nullable', 'string', 'max:255'],
            'transaction_ref' => ['nullable', 'string', 'max:100'],
            'collected_at'    => ['nullable', 'date'],
            'remarks'         => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'loan_id.required'      => 'Loan is required.',
            'loan_id.exists'        => 'Loan not found.',
            'amount_paid.required'  => 'Amount is required.',
            'amount_paid.min'       => 'Amount must be at least ₹1.',
            'payment_mode.required' => 'Payment mode is required.',
            'payment_mode.in'       => 'Payment mode must be cash, upi or card.',
        ];
    }
}