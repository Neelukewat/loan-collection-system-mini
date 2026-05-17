<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class LoanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // force validation errors to always return JSON
    protected function failedValidation(Validator $validator)
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
        // if updating, fields are optional
        // if creating, fields are required
        $isUpdate = $this->isMethod('put') || $this->isMethod('patch');

        return [
            'customer_name'  => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:150'],
            'mobile'         => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:15', 'regex:/^[6-9]\d{9}$/'],
            'address'        => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:500'],
            'loan_amount'    => [$isUpdate ? 'sometimes' : 'required', 'numeric', 'min:1000'],
            'emi_amount'     => [$isUpdate ? 'sometimes' : 'required', 'numeric', 'min:100'],
            'tenure_months'  => [$isUpdate ? 'sometimes' : 'required', 'integer', 'min:1', 'max:360'],
            'disbursed_at'   => [$isUpdate ? 'sometimes' : 'required', 'date'],
            'first_emi_date' => [$isUpdate ? 'sometimes' : 'required', 'date', 'after_or_equal:disbursed_at'],
            'status'         => ['sometimes', 'in:active,closed,defaulted'],
            'notes'          => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'mobile.regex'                  => 'Enter a valid 10-digit mobile number.',
            'emi_amount.min'                => 'EMI amount must be at least ₹100.',
            'loan_amount.min'               => 'Loan amount must be at least ₹1000.',
            'first_emi_date.after_or_equal' => 'First EMI date must be on or after disbursement date.',
        ];
    }
}