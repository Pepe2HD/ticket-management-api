<?php

namespace App\Actions\Tickets;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use App\Notifications\TicketResolvedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ChangeTicketStatusAction
{
    public function execute(Ticket $ticket, TicketStatus $newStatus, int $userId): Ticket
    {
        return DB::transaction(function () use ($ticket, $newStatus, $userId) {
            if ($ticket->status === TicketStatus::RESOLVIDO) {
                throw ValidationException::withMessages([
                    'status' => 'Nao e permitido alterar o status de um ticket resolvido.'
                ]);
            }

            // Impede retrocesso de status
            $statusOrder = [
                TicketStatus::ABERTO->value => 0,
                TicketStatus::EM_ANDAMENTO->value => 1,
                TicketStatus::RESOLVIDO->value => 2,
            ];

            $currentOrder = $statusOrder[$ticket->status->value] ?? 0;
            $newOrder = $statusOrder[$newStatus->value] ?? 0;

            if ($newOrder < $currentOrder) {
                throw ValidationException::withMessages([
                    'status' => 'Nao e permitido retroceder o status do ticket.'
                ]);
            }

            $previousStatus = $ticket->status;

            // Não criar log se o status não mudou
            if ($previousStatus !== $newStatus) {
                TicketStatusHistory::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => $userId,
                    'de' => $previousStatus,
                    'para' => $newStatus,
                ]);
            }

            $ticket->status = $newStatus;

            if ($newStatus === TicketStatus::EM_ANDAMENTO && !$ticket->responsavel_id) {
                $ticket->responsavel_id = $userId;
            }

            $shouldNotify = $newStatus === TicketStatus::RESOLVIDO && $previousStatus !== TicketStatus::RESOLVIDO;

            if ($newStatus === TicketStatus::RESOLVIDO && !$ticket->resolved_at) {
                $ticket->resolved_at = now();
            }

            $ticket->save();
            $ticket->refresh()->load([
                'solicitante',
                'responsavel',
                'statusHistory.user'
            ]);

            if ($shouldNotify && $ticket->solicitante) {
                $ticket->solicitante->notify(new TicketResolvedNotification($ticket));
            }

            return $ticket;
        });
    }
}
