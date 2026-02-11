<?php

namespace App\Actions\Tickets;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use Illuminate\Support\Facades\DB;

class ChangeTicketStatusAction
{
    public function execute(Ticket $ticket, TicketStatus $newStatus, int $userId): Ticket
    {
        return DB::transaction(function () use ($ticket, $newStatus, $userId) {
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

            if ($newStatus === TicketStatus::RESOLVIDO && !$ticket->resolved_at) {
                $ticket->resolved_at = now();
            }

            $ticket->save();
            $ticket->refresh()->load([
                'solicitante',
                'responsavel',
                'statusHistory.user'
            ]);

            return $ticket;
        });
    }
}
