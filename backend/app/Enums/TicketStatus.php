<?php

namespace App\Enums;

enum TicketStatus: string
{
    case ABERTO = 'ABERTO';
    case EM_ANDAMENTO = 'EM_ANDAMENTO';
    case RESOLVIDO = 'RESOLVIDO';
}
