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

            $previousStatus = $ticket->status;

            TicketStatusHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $userId,
                'de' => $previousStatus,
                'para' => $newStatus,
            ]);

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
