<?php

namespace App\Http\Requests;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:120'],
            'descricao' => ['required', 'string', 'min:20'],
            'status' => ['sometimes', Rule::enum(TicketStatus::class)],
            'prioridade' => ['sometimes', Rule::enum(TicketPriority::class)],
            'responsavel_id' => ['nullable', 'exists:users,id'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Define o solicitante como o usuário autenticado
        $this->merge([
            'solicitante_id' => auth()->id(),
            'status' => TicketStatus::ABERTO->value,
        ]);

        $this->offsetUnset('resolved_at');
        $this->offsetUnset('id'); 
        $this->offsetUnset('created_at'); 
        $this->offsetUnset('updated_at'); 
        $this->offsetUnset('deleted_at'); 
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'titulo.required' => 'O título é obrigatório.',
            'titulo.max' => 'O título não pode ter mais de 120 caracteres.',
            'descricao.required' => 'A descrição é obrigatória.',
            'descricao.min' => 'A descrição deve ter no mínimo 20 caracteres.',
            'status.enum' => 'Status inválido. Use: ABERTO, EM_ANDAMENTO ou RESOLVIDO.',
            'prioridade.enum' => 'Prioridade inválida. Use: BAIXA, MEDIA ou ALTA.',
            'responsavel_id.exists' => 'O responsável selecionado não existe.',
        ];
    }
}
