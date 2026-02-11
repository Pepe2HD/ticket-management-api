<?php

namespace App\Actions\Tickets;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use Illuminate\Support\Facades\DB;

class CreateTicketAction
{
    public function execute(array $data, int $userId): Ticket
    {
        return DB::transaction(function () use ($data, $userId) {
            $payload = $data;
            $payload['solicitante_id'] = $userId;
            $payload['status'] = TicketStatus::ABERTO;

            $ticket = Ticket::create($payload);
            $ticket->load(['solicitante', 'responsavel']);

            return $ticket;
        });
    }
}
