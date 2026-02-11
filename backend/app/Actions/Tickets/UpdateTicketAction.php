<?php

namespace App\Actions\Tickets;

use App\Models\Ticket;
use Illuminate\Support\Facades\DB;

class UpdateTicketAction
{
    public function execute(Ticket $ticket, array $data): Ticket
    {
        return DB::transaction(function () use ($ticket, $data) {
            $ticket->update($data);
            $ticket->refresh()->load(['solicitante', 'responsavel']);

            return $ticket;
        });
    }
}
