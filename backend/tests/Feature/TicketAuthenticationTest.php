<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testes de Autenticação de Tickets
 * 
 * Verifica se as rotas estão protegidas e se apenas usuários
 * autenticados podem acessá-las.
 */
class TicketAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_list_tickets(): void
    {
        $response = $this->getJson('/api/tickets');

        $response->assertStatus(401);
    }

    public function test_invalid_token_returns_401(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer fake_token')
                         ->getJson('/api/tickets');

        $response->assertStatus(401);
    }

    public function test_returns_404_when_ticket_not_found(): void
    {
        $user = User::factory()->create();
        
        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/api/tickets/9999');

        $response->assertStatus(404);
    }
}
