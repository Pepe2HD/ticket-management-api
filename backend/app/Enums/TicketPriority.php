<?php

namespace App\Enums;

enum TicketPriority: string
{
    case BAIXA = 'BAIXA';
    case MEDIA = 'MEDIA';
    case ALTA = 'ALTA';
}
