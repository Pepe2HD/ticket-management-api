<?php

namespace App\Models;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'titulo',
        'descricao',
        'status',
        'prioridade',
        'solicitante_id',
        'responsavel_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
            'status' => TicketStatus::class,
            'prioridade' => TicketPriority::class,
        ];
    }

    /**
     * Relacionamento: Usuário que abriu o chamado (solicitante).
     */
    public function solicitante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    /**
     * Relacionamento: Usuário responsável pelo chamado.
     */
    public function responsavel(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsavel_id');
    }

    /**
     * Relacionamento: Histórico de mudanças de status.
     * 
     * Nota: Este relacionamento pressupõe a existência de uma tabela
     * 'ticket_status_histories' que ainda precisa ser criada.
     */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(TicketStatusHistory::class);
    }

    /**
     * Scopes para facilitar queries comuns.
     */
    public function scopeStatus($query, TicketStatus $status)
    {
        return $query->where('status', $status->value);
    }

    public function scopePrioridade($query, TicketPriority $prioridade)
    {
        return $query->where('prioridade', $prioridade->value);
    }

    public function scopeSearch($query, ?string $term)
    {
        if (!$term) {
            return $query;
        }

        $search = trim($term);

        return $query->where(function ($q) use ($search) {
            $q->where('titulo', 'like', "%{$search}%")
              ->orWhere('descricao', 'like', "%{$search}%");
        });
    }

    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['prioridade'] ?? null, fn ($q, $prioridade) => $q->where('prioridade', $prioridade))
            ->search($filters['q'] ?? null);
    }

    public function scopeOrderByStatusPriority($query)
    {
        return $query->orderByRaw(
            "CASE status WHEN 'ABERTO' THEN 1 WHEN 'EM_ANDAMENTO' THEN 2 WHEN 'RESOLVIDO' THEN 3 ELSE 4 END"
        );
    }

    public function scopeDoSolicitante($query, int $userId)
    {
        return $query->where('solicitante_id', $userId);
    }

    public function scopeDoResponsavel($query, int $userId)
    {
        return $query->where('responsavel_id', $userId);
    }

    /**
     * Métodos auxiliares para verificação de status.
     */
    public function isStatus(TicketStatus $status): bool
    {
        return $this->status === $status;
    }

    public function isPrioridade(TicketPriority $prioridade): bool
    {
        return $this->prioridade === $prioridade;
    }


    /**
     * Métodos auxiliares para verificação de prioridade.
     */
    public function isPrioridadeAlta(): bool
    {
        return $this->prioridade === TicketPriority::ALTA;
    }

    public function isPrioridadeMedia(): bool
    {
        return $this->prioridade === TicketPriority::MEDIA;
    }

    public function isPrioridadeBaixa(): bool
    {
        return $this->prioridade === TicketPriority::BAIXA;
    }

    /**
     * Verifica se o ticket tem um responsável atribuído.
     */
    public function temResponsavel(): bool
    {
        return !is_null($this->responsavel_id);
    }

    /**
     * Marca o ticket como resolvido.
     */
    public function marcarComoResolvido(): void
    {
        $this->update([
            'status' => TicketStatus::RESOLVIDO,
            'resolved_at' => now(),
        ]);
    }

    /**
     * Atribui um responsável ao ticket.
     */
    public function atribuirResponsavel(int $userId): void
    {
        $this->update([
            'responsavel_id' => $userId,
            'status' => TicketStatus::EM_ANDAMENTO,
        ]);
    }
}
