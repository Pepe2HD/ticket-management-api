<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testes de Filtros e Busca de Tickets
 * 
 * Testa funcionalidades de filtro por status, prioridade e busca por texto.
 */
class TicketFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_filter_tickets_by_status(): void
    {
        $user = User::factory()->create();
        
        $this->actingAs($user, 'sanctum');

        // Criar tickets com o usuário como solicitante para que apareçam na listagem
        Ticket::factory()->create([
            'status' => 'ABERTO',
            'solicitante_id' => $user->id
        ]);
        
        Ticket::factory()->create([
            'status' => 'RESOLVIDO',
            'solicitante_id' => $user->id
        ]);

        $response = $this->getJson('/api/tickets?status=ABERTO');

        $response->assertOk()
                 ->assertJsonCount(1, 'data');
    }

    public function test_can_search_ticket_by_title(): void
    {
        $user = User::factory()->create();
        
        $this->actingAs($user, 'sanctum');

        // Criar tickets com o usuário como solicitante para que apareçam na listagem
        Ticket::factory()->create([
            'titulo' => 'Erro crítico no sistema',
            'solicitante_id' => $user->id
        ]);
        
        Ticket::factory()->create([
            'titulo' => 'Outro chamado normal',
            'solicitante_id' => $user->id
        ]);

        $response = $this->getJson('/api/tickets?q=crítico');

        $response->assertOk()
                 ->assertJsonCount(1, 'data');
    }
}
