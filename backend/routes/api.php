<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Resources\UserResource;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health Check - Endpoint público para monitoramento
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'service' => config('app.name'),
    ]);
})->name('health');

// Rota pública - Autenticação
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:6,1')
    ->name('login');

// Rotas protegidas - Requer autenticação + Rate Limiting
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    // Autenticação
    Route::post('/logout', [AuthController::class, 'logout'])
        ->name('logout');

    Route::get('/me', function (Request $request) {
        return new UserResource($request->user());
    })->name('me');

    // Tickets - CRUD completo (requer autenticação)
    Route::apiResource('tickets', TicketController::class);
    
    // Alteração de status - APENAS ADMINISTRADORES
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'changeStatus'])
        ->middleware('can:changeStatus,ticket')
        ->name('tickets.change-status');
});
