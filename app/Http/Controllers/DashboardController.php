<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\Collection as LoanCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    // GET /api/dashboard
    // returns all key metrics in optimized queries
    public function index(): JsonResponse
    {
        try {
            // get all loan stats in a single query
            $loanStats = DB::table('loans')->selectRaw('
                COUNT(*) as total_loans,
                SUM(CASE WHEN status = "active"  THEN 1 ELSE 0 END) as active_loans,
                SUM(CASE WHEN status = "closed"  THEN 1 ELSE 0 END) as closed_loans,
                SUM(loan_amount) as total_disbursed
            ')->first();

            // get all collection stats in a single query
            $collectionStats = DB::table('collections')->selectRaw('
                SUM(amount_paid) as total_collected,
                SUM(CASE WHEN DATE(collected_at) = CURDATE() THEN amount_paid ELSE 0 END) as collected_today,
                SUM(CASE WHEN DATE(collected_at) = CURDATE() AND payment_mode = "cash" THEN amount_paid ELSE 0 END) as cash_today,
                SUM(CASE WHEN DATE(collected_at) = CURDATE() AND payment_mode = "upi"  THEN amount_paid ELSE 0 END) as upi_today,
                SUM(CASE WHEN DATE(collected_at) = CURDATE() AND payment_mode = "card" THEN amount_paid ELSE 0 END) as card_today
            ')->first();

            // pending = total disbursed - total collected
            $pendingAmount = $loanStats->total_disbursed - $collectionStats->total_collected;

            return response()->json([
                'success' => true,
                'data'    => [
                    'total_loans'        => (int)   $loanStats->total_loans,
                    'active_loans'       => (int)   $loanStats->active_loans,
                    'closed_loans'       => (int)   $loanStats->closed_loans,
                    'total_disbursed'    => (float) $loanStats->total_disbursed,
                    'total_collected'    => (float) $collectionStats->total_collected,
                    'collected_today'    => (float) $collectionStats->collected_today,
                    'pending_amount'     => (float) max(0, $pendingAmount),
                    'collection_by_mode' => [
                        'cash' => (float) $collectionStats->cash_today,
                        'upi'  => (float) $collectionStats->upi_today,
                        'card' => (float) $collectionStats->card_today,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard data.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }


    // GET /api/dashboard/prediction
    // analyse past collections and return best 2-hour collection window
    public function prediction(): JsonResponse
    {
        try {
            /*
            We group all collections by hour (0-23) for last 90 days
            and get count and total amount for each hour.
            */
            $hourlyStats = DB::table('collections')
                ->selectRaw('HOUR(collected_at) as hour, COUNT(*) as count, SUM(amount_paid) as total')
                ->where('collected_at', '>=', now()->subDays(90))
                ->groupBy(DB::raw('HOUR(collected_at)'))
                ->orderBy('hour')
                ->get()
                ->keyBy('hour'); // key by hour so we can access like $hourlyStats[9]

            // if not enough data return default slot
            if ($hourlyStats->count() < 3) {
                return response()->json([
                    'success' => true,
                    'data'    => [
                        'best_slot'   => '10:00 AM - 12:00 PM',
                        'insight'     => 'Not enough data yet. Default morning slot shown.',
                        'data_points' => 0,
                    ],
                ]);
            }

            /*
            We need all 24 hours with 0 for missing ones
            so our sliding window works correctly.
            */
            $hours = collect(range(0, 23))->mapWithKeys(function ($hour) use ($hourlyStats) {
                return [
                    $hour => [
                        'hour'  => $hour,
                        'count' => $hourlyStats->has($hour) ? (int)   $hourlyStats[$hour]->count : 0,
                        'total' => $hourlyStats->has($hour) ? (float) $hourlyStats[$hour]->total : 0,
                    ]
                ];
            });

            /*
            We cannot directly compare count and amount because they
            have different scales. (count=20, amount=100000)
            Normalising brings both to 0-1 scale so we can combine them.
            */
            $maxCount = $hours->max('count') ?: 1; // avoid division by zero
            $maxTotal = $hours->max('total') ?: 1;

            /*
            Count is weighted 60% because reaching more customer is the primary goal of field agents.  
            Amount is weighted 40% because higher collection , amount is also important but secondary.
            */
            $scored = $hours->map(function ($h) use ($maxCount, $maxTotal) {
                return [
                    ...$h,
                    'score' => 0.6 * ($h['count'] / $maxCount)
                        + 0.4 * ($h['total'] / $maxTotal),
                ];
            });

            /*
            We check every possible 2-hour window (0-1, 1-2, 2-3 ... 23-0)
        a   nd find the one with the highest combined score.
            */
            $bestWindow = collect(range(0, 23))->map(function ($start) use ($scored) {
                $next = ($start + 1) % 24; // wrap around midnight (23 -- 0)
                return [
                    'start' => $start,
                    'end'   => ($start + 2) % 24,
                    'score' => $scored[$start]['score'] + $scored[$next]['score'],
                    'count' => $scored[$start]['count'] + $scored[$next]['count'],
                    'total' => $scored[$start]['total'] + $scored[$next]['total'],
                ];
            })->sortByDesc('score')->first(); // get window with highest score

            // format hours to AM/PM
            $startLabel = $this->formatHour($bestWindow['start']);
            $endLabel   = $this->formatHour($bestWindow['end']);

            // total collections analysed
            $totalDataPoints = $hours->sum('count');

            return response()->json([
                'success' => true,
                'data'    => [
                    'best_slot'   => $startLabel . ' - ' . $endLabel,
                    'start_hour'  => $bestWindow['start'],
                    'end_hour'    => $bestWindow['end'],
                    'insight'     => "Based on {$totalDataPoints} collections in last 90 days, "
                        . "best time to collect is between {$startLabel} and {$endLabel}.",
                    'stats'       => [
                        'collections_in_window' => $bestWindow['count'],
                        'amount_in_window'      => $bestWindow['total'],
                        'total_analysed'        => $totalDataPoints,
                    ],
                    'data_points' => $totalDataPoints,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get prediction.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // format hour integer to AM/PM string
    private function formatHour(int $hour): string
    {
        $suffix  = $hour < 12 ? 'AM' : 'PM';
        $display = $hour === 0 ? 12 : ($hour > 12 ? $hour - 12 : $hour);
        return "{$display}:00 {$suffix}";
    }
}
