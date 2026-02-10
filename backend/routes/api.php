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

// Rota pública - Autenticação
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:6,1')
    ->name('login');

// Rotas protegidas - Requer autenticação
Route::middleware('auth:sanctum')->group(function () {
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
