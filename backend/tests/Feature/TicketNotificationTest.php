<?php

namespace Tests\Feature;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use App\Notifications\TicketResolvedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Testes de Notificações de Tickets
 * 
 * Verifica se as notificações são enviadas corretamente
 * quando um ticket muda de status.
 */
class TicketNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_notification_is_sent_when_ticket_is_resolved(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['is_admin' => true]);
        $solicitante = User::factory()->create(['is_admin' => false]);
        
        $ticket = Ticket::factory()->create([
            'status' => TicketStatus::ABERTO,
            'solicitante_id' => $solicitante->id,
        ]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::RESOLVIDO->value,
        ]);

        $response->assertOk();

        Notification::assertSentTo($solicitante, TicketResolvedNotification::class);
    }

    public function test_notification_is_not_sent_when_changing_to_em_andamento(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['is_admin' => true]);
        $solicitante = User::factory()->create(['is_admin' => false]);
        
        $ticket = Ticket::factory()->create([
            'status' => TicketStatus::ABERTO,
            'solicitante_id' => $solicitante->id,
        ]);

        $this->actingAs($admin, 'sanctum');

        $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::EM_ANDAMENTO->value,
        ]);

        Notification::assertNothingSent();
    }

    public function test_notification_is_queued(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['is_admin' => true]);
        $solicitante = User::factory()->create(['is_admin' => false]);
        
        $ticket = Ticket::factory()->create([
            'status' => TicketStatus::ABERTO,
            'solicitante_id' => $solicitante->id,
        ]);

        $this->actingAs($admin, 'sanctum');

        $this->patchJson("/api/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::RESOLVIDO->value,
        ]);

        Notification::assertSentTo($solicitante, TicketResolvedNotification::class, function ($notification) {
            return $notification instanceof \Illuminate\Contracts\Queue\ShouldQueue;
        });
    }
}
