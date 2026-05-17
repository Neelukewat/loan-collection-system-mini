<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
});

// Protected routes - both admin and field agent
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
    });

    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('dashboard/prediction', [DashboardController::class, 'prediction']);


    // Loans - both can view
    Route::get('loans',        [LoanController::class, 'index']);
    Route::get('loans/{id}',   [LoanController::class, 'show']);

    // Loans - admin only
    Route::middleware('role:admin')->group(function () {
        Route::post('loans',       [LoanController::class, 'store']);
        Route::put('loans/{id}',   [LoanController::class, 'update']);
        Route::delete('loans/{id}',[LoanController::class, 'destroy']);
    });

    // Collections - both admin and field agent
    Route::get('collections',      [CollectionController::class, 'index']);
    Route::post('collections',     [CollectionController::class, 'store']);
    Route::get('collections/{id}', [CollectionController::class, 'show']);

});