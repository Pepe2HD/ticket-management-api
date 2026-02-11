<?php

namespace App\Enums;

enum TicketPriority: string
{
    case BAIXA = 'BAIXA';
    case MEDIA = 'MEDIA';
    case ALTA = 'ALTA';

    public function label(): string
    {
        return match ($this) {
            self::BAIXA => 'Baixa',
            self::MEDIA => 'Media',
            self::ALTA => 'Alta',
        };
    }
}
