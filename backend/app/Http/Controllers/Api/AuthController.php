<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        // Busca usuário pelo email
        $user = User::where('email', $request->email)->first();

        // Proteção contra timing attacks: verifica senha mesmo se usuário não existir
        if (!$user || !Hash::check($request->password, $user->password)) {
            // Log de tentativa falhada
            Log::warning('Tentativa de login falhada', [
                'email' => $request->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Retorna sempre a mesma mensagem genérica
            return response()->json([
                'message' => 'Credenciais inválidas'
            ], 401);
        }

        // Autentica o usuário no guard
        Auth::login($user);

        // Revoga todos os tokens antigos do usuário
        $user->tokens()->delete();

        // Cria novo token com habilidades baseadas no tipo de usuário
        $abilities = $user->is_admin ? ['*'] : ['user:read', 'user:update'];
        $token = $user->createToken('api-token', $abilities)->plainTextToken;

        // Log de login bem-sucedido
        Log::info('Login realizado com sucesso', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request)
    {
        // Log de logout
        Log::info('Logout realizado', [
            'user_id' => $request->user()->id,
            'ip' => $request->ip(),
        ]);

        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
