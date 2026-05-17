<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\Loan;
use App\Http\Requests\CollectionRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    // GET /api/collections
    // list all collections with filters and pagination
    public function index(Request $request): JsonResponse
    {
        try {
            $collections = Collection::with('loan:id,loan_no,customer_name')
                ->when($request->loan_id, fn($q) => $q->where('loan_id', $request->loan_id))
                ->when($request->payment_mode, fn($q) => $q->where('payment_mode', $request->payment_mode))
                ->when($request->from_date, fn($q) => $q->whereDate('collected_at', '>=', $request->from_date))
                ->when($request->to_date, fn($q) => $q->whereDate('collected_at', '<=', $request->to_date))
                ->latest('collected_at')
                ->paginate($request->per_page ?? 10);

            return response()->json([
                'success' => true,
                'data'    => $collections,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch collections.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // POST /api/collections
    // add a new collection entry
    public function store(CollectionRequest $request): JsonResponse
    {
        try {
            // get the loan
            $loan = Loan::where('id', $request->loan_id)->first();

            // check if loan is already closed
            if ($loan->status === 'closed') {
                return response()->json([
                    'success' => false,
                    'message' => 'This loan is already closed.',
                ], 422);
            }

            // calculate total already collected for this loan
            $totalCollected = Collection::where('loan_id', $loan->id)->sum('amount_paid');

            // calculate pending amount
            $pendingAmount = $loan->loan_amount - $totalCollected;

            // amount paid should not exceed pending amount
            if ($request->amount_paid > $pendingAmount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Amount exceeds pending balance.',
                    'data'    => [
                        'loan_amount'     => $loan->loan_amount,
                        'total_collected' => $totalCollected,
                        'pending_amount'  => $pendingAmount,
                    ],
                ], 422);
            }

            // create collection
            $collection = Collection::create([
                'loan_id'         => $loan->id,
                'amount_paid'     => $request->amount_paid,
                'payment_mode'    => $request->payment_mode,
                'location'        => $request->location,
                'transaction_ref' => $request->transaction_ref,
                'collected_at'    => $request->collected_at ?? now(),
                'collected_by'    => $request->user()->id,
                'remarks'         => $request->remarks,
            ]);

            // auto close loan if fully paid
            $newPending = $pendingAmount - $request->amount_paid;
            if ($newPending <= 0) {
                $loan->update(['status' => 'closed']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Collection added successfully.' . ($newPending <= 0 ? ' Loan is now closed.' : ''),
                'data'    => [
                    'collection'     => $collection,
                    'pending_amount' => max(0, $newPending),
                    'loan_closed'    => $newPending <= 0,
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add collection.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // GET /api/collections/{id}
    // get single collection by id
    public function show($id): JsonResponse
    {
        try {
            $collection = Collection::with('loan:id,loan_no,customer_name')
                ->where('id', $id)
                ->first();

            if (!$collection) {
                return response()->json([
                    'success' => false,
                    'message' => 'Collection not found.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $collection,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch collection.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}