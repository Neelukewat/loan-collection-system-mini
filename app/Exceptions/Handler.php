<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\Routing\Exception\RouteNotFoundException;
use Throwable;

class Handler extends ExceptionHandler
{
    // exceptions that should not be reported
    protected $dontReport = [];

    // exceptions that should not be flashed to session
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    // handle unauthenticated requests
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        return response()->json([
            'success' => false,
            'message' => 'Unauthenticated. Please login first.',
        ], 401);
    }

    // render exceptions as JSON for API routes
    public function render($request, Throwable $e)
    {
        // handle route not found (missing login route)
        if ($e instanceof RouteNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login first.',
            ], 401);
        }

        return parent::render($request, $e);
    }
}