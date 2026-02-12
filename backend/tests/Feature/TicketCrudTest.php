<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testes CRUD de Tickets
 * 
 * Testa as operações básicas de Create, Read, Update e Delete.
 */
class TicketCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_tickets(): void
    {
        $user = User::factory()->create();
        Ticket::factory()->count(3)->create(['solicitante_id' => $user->id]);

        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/api/tickets');

        $response->assertOk()
                 ->assertJsonCount(3, 'data');
    }

    public function test_user_can_create_ticket(): void
    {
        $user = User::factory()->create();
        
        $this->actingAs($user, 'sanctum');

        $data = [
            'titulo' => 'Problema no sistema',
            'descricao' => 'Descrição com mais de 20 caracteres válida.',
            'prioridade' => 'MEDIA',
            'status' => 'ABERTO',
        ];

        $response = $this->postJson('/api/tickets', $data);

        $response->assertCreated();

        $this->assertDatabaseHas('tickets', [
            'titulo' => 'Problema no sistema',
            'solicitante_id' => $user->id,
        ]);
    }

    public function test_cannot_create_ticket_with_invalid_data(): void
    {
        $user = User::factory()->create();
        
        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/tickets', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['titulo', 'descricao']);
    }

    public function test_deleted_ticket_uses_soft_delete(): void
    {
        $user = User::factory()->create();
        $ticket = Ticket::factory()->create([
            'solicitante_id' => $user->id,
        ]);

        $this->actingAs($user, 'sanctum');

        $response = $this->deleteJson("/api/tickets/{$ticket->id}");

        $response->assertNoContent();

        // Verificar que o ticket foi soft deleted, não removido fisicamente
        $this->assertSoftDeleted('tickets', [
            'id' => $ticket->id,
        ]);

        // Verificar que ainda existe no banco mas com deleted_at preenchido
        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
        ]);

        // Verificar que deleted_at não é null
        $this->assertNotNull(Ticket::withTrashed()->find($ticket->id)->deleted_at);
    }
}
