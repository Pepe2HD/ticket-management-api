<?php

namespace App\Http\Requests;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $ticket = $this->route('ticket');
        if (!$ticket || !auth()->check()) {
            return false;
        }

        $user = auth()->user();

        // Permite atualização se for o solicitante, responsável ou admin
        $podeAtualizar = (
            $ticket->solicitante_id === $user->id ||
            $ticket->responsavel_id === $user->id ||
            $user->is_admin
        );

        // Atualização permitida apenas se o ticket estiver ABERTO
        return $podeAtualizar && $ticket->status === TicketStatus::ABERTO;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['sometimes', 'string', 'max:120'],
            'descricao' => ['sometimes', 'string', 'min:20'],
            'prioridade' => ['sometimes', Rule::enum(TicketPriority::class)],
            'responsavel_id' => ['nullable', 'exists:users,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'titulo.max' => 'O título não pode ter mais de 120 caracteres.',
            'descricao.min' => 'A descrição deve ter no mínimo 20 caracteres.',
            'status.enum' => 'Status inválido. Use: ABERTO, EM_ANDAMENTO ou RESOLVIDO.',
            'prioridade.enum' => 'Prioridade inválida. Use: BAIXA, MEDIA ou ALTA.',
            'responsavel_id.exists' => 'O responsável selecionado não existe.',
        ];
    }
}
