<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Http\Requests\LoanRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    // GET /api/loans
    // list all loans with filters and pagination
    public function index(Request $request): JsonResponse
    {
        try {
            $loans = Loan::withSum('collections as total_collected', 'amount_paid')
                ->when($request->search, fn($q) => $q->search($request->search))
                ->when($request->status, fn($q) => $q->where('status', $request->status))
                ->when($request->from_date, fn($q) => $q->whereDate('disbursed_at', '>=', $request->from_date))
                ->when($request->to_date, fn($q) => $q->whereDate('disbursed_at', '<=', $request->to_date))
                ->latest()
                ->paginate($request->per_page ?? 10);

            // calculate pending amount for each loan
            $loans->getCollection()->transform(function ($loan) {
                $loan->pending_amount = max(0, $loan->loan_amount - ($loan->total_collected ?? 0));
                return $loan;
            });

            return response()->json([
                'success' => true,
                'data'    => $loans,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch loans.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // POST /api/loans
    // create a new loan
    public function store(LoanRequest $request): JsonResponse
    {
        try {
            $loan = Loan::create([
                ...$request->validated(),
                'loan_no'    => $this->generateLoanNo(),
                'created_by' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Loan created successfully.',
                'data'    => $loan,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create loan.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // GET /api/loans/{id}
    // get single loan by id
    public function show($id): JsonResponse
    {
        try {
            $loan = Loan::where('id', $id)->first();

            if (!$loan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Loan not found.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $loan,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch loan.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // PUT /api/loans/{id}
    // update loan details
    public function update(LoanRequest $request, $id): JsonResponse
    {
        try {
            $loan = Loan::where('id', $id)->first();

            if (!$loan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Loan not found.',
                ], 404);
            }

            $loan->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Loan updated successfully.',
                'data'    => $loan->fresh(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update loan.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // DELETE /api/loans/{id}
    // delete loan only if no collections exist
    public function destroy($id): JsonResponse
    {
        try {
            $loan = Loan::where('id', $id)->first();

            if (!$loan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Loan not found.',
                ], 404);
            }

            // cannot delete loan that already has collections
            if ($loan->collections()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete loan that already has collections.',
                ], 422);
            }

            $loan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Loan deleted successfully.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete loan.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // generate unique loan number format: LN-YYYYMM-XXXXX
    private function generateLoanNo(): string
    {
        $prefix = 'LN-' . now()->format('Ym') . '-';
        $last   = Loan::where('loan_no', 'like', $prefix . '%')
                      ->orderByDesc('id')
                      ->value('loan_no');

        $seq = $last ? ((int) substr($last, -5)) + 1 : 1;

        return $prefix . str_pad($seq, 5, '0', STR_PAD_LEFT);
    }
}