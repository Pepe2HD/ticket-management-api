<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    /**
     * Transform the ticket resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'prioridade' => [
                'value' => $this->prioridade->value,
                'label' => $this->prioridade->label(),
            ],
            
            // Informações do solicitante
            'solicitante' => [
                'id' => $this->solicitante->id,
                'name' => $this->solicitante->name,
                'email' => $this->solicitante->email,
            ],
            
            // Informações do responsável (se existir)
            'responsavel' => $this->when($this->responsavel, function () {
                return [
                    'id' => $this->responsavel->id,
                    'name' => $this->responsavel->name,
                    'email' => $this->responsavel->email,
                ];
            }),
            
            // Timestamps
            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
            
            // Inclui histórico se explicitamente carregado
            'status_history' => TicketStatusHistoryResource::collection(
                $this->whenLoaded('statusHistory')
            ),
        ];
    }
}
