<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call(UserSeeder::class);

        // Cria tickets com status variados para demonstração
        $users = \App\Models\User::all();
        $admin = $users->where('is_admin', true)->first();
        $user = $users->where('is_admin', false)->first();

        // 2 tickets ABERTO
        \App\Models\Ticket::factory()->count(2)->create([
            'status' => \App\Enums\TicketStatus::ABERTO,
            'solicitante_id' => $user->id,
        ]);

        // 3 tickets EM_ANDAMENTO
        \App\Models\Ticket::factory()->count(3)->create([
            'status' => \App\Enums\TicketStatus::EM_ANDAMENTO,
            'solicitante_id' => $user->id,
            'responsavel_id' => $admin->id,
        ]);

        // 2 tickets RESOLVIDO
        \App\Models\Ticket::factory()->count(2)->create([
            'status' => \App\Enums\TicketStatus::RESOLVIDO,
            'solicitante_id' => $user->id,
            'responsavel_id' => $admin->id,
            'resolved_at' => now()->subDays(rand(1, 7)),
        ]);

        // 3 tickets aleatórios
        \App\Models\Ticket::factory()->count(3)->create([
            'solicitante_id' => $user->id,
        ]);
    }
}
