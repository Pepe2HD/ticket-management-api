<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketStatusHistoryResource extends JsonResource
{
    /**
     * Transform the status history resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'de' => $this->de
                ? [
                    'value' => $this->de->value,
                    'label' => $this->de->label(),
                ]
                : null,
            'para' => [
                'value' => $this->para->value,
                'label' => $this->para->label(),
            ],
            
            // Usuário que fez a alteração
            'user' => $this->when($this->user, function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            
            // Informações do ticket relacionado (opcional)
            'ticket' => $this->when($this->relationLoaded('ticket'), function () {
                return [
                    'id' => $this->ticket->id,
                    'titulo' => $this->ticket->titulo,
                ];
            }),
            
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
