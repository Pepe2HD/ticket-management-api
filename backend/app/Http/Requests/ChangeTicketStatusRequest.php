<?php

namespace App\Http\Requests;

use App\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeTicketStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * 
     * Apenas usuários administradores (is_admin = true) podem alterar o status de um ticket.
     * Isso garante que mudanças de status sejam controladas por pessoas autorizadas.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->is_admin;
    }

    /**
     * Get the validation rules that apply to the request.
     * 
     * Define que o campo 'status' é obrigatório e deve ser um dos valores
     * válidos do enum TicketStatus (ABERTO, EM_ANDAMENTO, RESOLVIDO).
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(TicketStatus::class)],
        ];
    }

    /**
     * Prepare the data for validation.
     * 
     * Este método é executado ANTES da validação e serve para:
     * 1. Remover campos que não devem ser alterados pelo usuário (solicitante_id, responsavel_id)
     * 2. Adicionar lógica automática: se o status mudar para RESOLVIDO e o ticket ainda não
     *    estiver resolvido, adiciona o timestamp de resolução (resolved_at).
     */
    protected function prepareForValidation(): void
    {
        $this->offsetUnset('solicitante_id');
        $this->offsetUnset('responsavel_id');
        
        $ticket = $this->route('ticket');

        if ($this->status === TicketStatus::RESOLVIDO->value && $ticket && !$ticket->isStatus(TicketStatus::RESOLVIDO)) {
            $this->merge([
                'resolved_at' => now(),
            ]);
        }
    }

    /**
     * Get custom messages for validator errors.
     * 
     * Define mensagens de erro personalizadas em português para melhorar
     * a experiência do usuário ao receber feedback de validação.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.required' => 'O status é obrigatório.',
            'status.enum' => 'Status inválido. Use: ABERTO, EM_ANDAMENTO ou RESOLVIDO.',
        ];
    }
}
