<?php

use App\Enums\TicketStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $statusValues = array_map(
            static fn (TicketStatus $status) => $status->value,
            TicketStatus::cases()
        );

        Schema::create('ticket_status_histories', function (Blueprint $table) use ($statusValues) {
            $table->id();
            
            $table->foreignId('ticket_id')
                  ->constrained('tickets')
                  ->onDelete('cascade');
            
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            
            $table->enum('de', $statusValues)->nullable();
            $table->enum('para', $statusValues);
            $table->timestamps();
            
            // Índices
            $table->index('ticket_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_status_histories');
    }
};
