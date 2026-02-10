<?php

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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 120);
            $table->text('descricao');
            
            // Enums para status e prioridade
            $table->enum('status', ['ABERTO', 'EM_ANDAMENTO', 'RESOLVIDO'])
                  ->default('ABERTO');
            $table->enum('prioridade', ['BAIXA', 'MEDIA', 'ALTA'])
                  ->default('MEDIA');
            
            // Foreign keys para usuários
            $table->foreignId('solicitante_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            
            $table->foreignId('responsavel_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            
            // Timestamp de resolução
            $table->timestamp('resolved_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Índices para melhor performance em queries
            $table->index('status');
            $table->index('prioridade');
            $table->index(['status', 'prioridade']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
