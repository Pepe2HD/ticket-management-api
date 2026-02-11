<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (ValidationException $exception, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Erro de validacao.',
                    'errors' => $exception->errors(),
                ], 422);
            }
        });

        $exceptions->renderable(function (AuthenticationException $exception, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Nao autenticado.',
                ], 401);
            }
        });

        $exceptions->renderable(function (AuthorizationException $exception, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Nao autorizado.',
                ], 403);
            }
        });

        $exceptions->renderable(function (ModelNotFoundException $exception, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Recurso nao encontrado.',
                ], 404);
            }
        });

        $exceptions->renderable(function (HttpExceptionInterface $exception, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $exception->getMessage() ?: 'Erro na requisicao.',
                ], $exception->getStatusCode());
            }
        });
    })->create();
