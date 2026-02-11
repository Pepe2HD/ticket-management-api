<?php

namespace Tests\Feature;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_status_patch_creates_log_and_sets_resolved_at(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $ticket = Ticket::factory()->create([
            'status' => TicketStatus::ABERTO,
            'resolved_at' => null,
        ]);

        Sanctum::actingAs($admin);

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
}
