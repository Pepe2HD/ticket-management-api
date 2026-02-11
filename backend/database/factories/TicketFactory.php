<?php

namespace Database\Factories;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ticket>
 */
class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        $status = $this->faker->randomElement(TicketStatus::cases());
        $prioridade = $this->faker->randomElement(TicketPriority::cases());
        $responsavelId = in_array($status, [TicketStatus::EM_ANDAMENTO, TicketStatus::RESOLVIDO], true)
            ? User::factory()->create()->id
            : null;

        return [
            'titulo' => $this->faker->sentence(6),
            'descricao' => $this->faker->paragraphs(2, true),
            'status' => $status,
            'prioridade' => $prioridade,
            'solicitante_id' => User::factory()->create()->id,
            'responsavel_id' => $responsavelId,
            'resolved_at' => $status === TicketStatus::RESOLVIDO ? now() : null,
        ];
    }
}
