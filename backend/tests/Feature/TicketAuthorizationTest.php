<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testes de Autorização de Tickets
 * 
 * Verifica permissões de acesso e ações que podem ser realizadas
 * por diferentes tipos de usuários (owner, admin, outros).
 */
class TicketAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_delete_ticket_from_another_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $ticket = Ticket::factory()->create([
            'solicitante_id' => $user1->id,
        ]);

        $this->actingAs($user2, 'sanctum');

        $response = $this->deleteJson("/api/tickets/{$ticket->id}");

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_any_ticket(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $ticket = Ticket::factory()->create();

        $this->actingAs($admin, 'sanctum');

        $response = $this->deleteJson("/api/tickets/{$ticket->id}");

        $response->assertNoContent();
    }

    public function test_only_owner_or_admin_can_delete_ticket(): void
    {
        $owner = User::factory()->create(['is_admin' => false]);
        $admin = User::factory()->create(['is_admin' => true]);
        $otherUser = User::factory()->create(['is_admin' => false]);

        $ticketByOwner = Ticket::factory()->create([
            'solicitante_id' => $owner->id,
        ]);

        $ticketByOther = Ticket::factory()->create([
            'solicitante_id' => $owner->id,
        ]);

        // Outro usuário não pode deletar ticket que não é dele
        $this->actingAs($otherUser, 'sanctum');
        $response = $this->deleteJson("/api/tickets/{$ticketByOwner->id}");
        $response->assertStatus(403);

        // Owner pode deletar seu próprio ticket
        $this->actingAs($owner, 'sanctum');
        $response = $this->deleteJson("/api/tickets/{$ticketByOwner->id}");
        $response->assertNoContent();

        // Admin pode deletar qualquer ticket
        $this->actingAs($admin, 'sanctum');
        $response = $this->deleteJson("/api/tickets/{$ticketByOther->id}");
        $response->assertNoContent();
    }
}
