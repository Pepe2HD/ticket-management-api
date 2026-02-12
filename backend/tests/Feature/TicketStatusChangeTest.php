<?php

namespace Tests\Feature;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testes de Mudança de Status de Tickets
 * 
 * Testa as regras de negócio relacionadas à mudança de status,
 * histórico de mudanças e validações.
 */
class TicketStatusChangeTest extends TestCase
{
    use RefreshDatabase;

    public function test_status_change_creates_log_and_sets_resolved_at(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $ticket = Ticket::factory()->create([
            'status' => TicketStatus::ABERTO,
            'resolved_at' => null,
        ]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::RESOLVIDO->value,
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('ticket_status_histories', [
            'ticket_id' => $ticket->id,
            'user_id' => $admin->id,
            'de' => TicketStatus::ABERTO->value,
            'para' => TicketStatus::RESOLVIDO->value,
        ]);

        $this->assertNotNull($ticket->fresh()->resolved_at);
    }

    public function test_same_status_does_not_create_log(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $ticket = Ticket::factory()->create([
            'status' => TicketStatus::ABERTO,
        ]);

        $this->actingAs($admin, 'sanctum');

        $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::ABERTO->value,
        ]);

        $this->assertDatabaseCount('ticket_status_histories', 0);
    }

    public function test_cannot_change_resolved_ticket_status(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $ticket = Ticket::factory()->create([
            'status' => TicketStatus::RESOLVIDO,
            'resolved_at' => now(),
        ]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::ABERTO->value,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['status']);

        // Verificar que o status não foi alterado no banco
        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => TicketStatus::RESOLVIDO->value,
        ]);
    }

    public function test_cannot_change_from_em_andamento_to_aberto(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $ticket = Ticket::factory()->create([
            'status' => TicketStatus::EM_ANDAMENTO,
        ]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::ABERTO->value,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['status']);

        // Verificar que o status não foi alterado no banco
        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => TicketStatus::EM_ANDAMENTO->value,
        ]);
    }

    public function test_cannot_change_from_resolvido_to_em_andamento(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $ticket = Ticket::factory()->create([
            'status' => TicketStatus::RESOLVIDO,
            'resolved_at' => now(),
        ]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::EM_ANDAMENTO->value,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['status']);

        // Verificar que o status não foi alterado no banco
        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => TicketStatus::RESOLVIDO->value,
        ]);
    }

    public function test_can_advance_status_from_aberto_to_em_andamento(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $ticket = Ticket::factory()->create([
            'status' => TicketStatus::ABERTO,
        ]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::EM_ANDAMENTO->value,
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => TicketStatus::EM_ANDAMENTO->value,
        ]);
    }

    public function test_can_advance_status_from_em_andamento_to_resolvido(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $ticket = Ticket::factory()->create([
            'status' => TicketStatus::EM_ANDAMENTO,
            'resolved_at' => null,
        ]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::RESOLVIDO->value,
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => TicketStatus::RESOLVIDO->value,
        ]);

        $this->assertNotNull($ticket->fresh()->resolved_at);
    }
}
