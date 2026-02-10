<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relacionamento: Tickets criados por este usuário (como solicitante).
     */
    public function ticketsSolicitados(): HasMany
    {
        return $this->hasMany(Ticket::class, 'solicitante_id');
    }

    /**
     * Relacionamento: Tickets atribuídos a este usuário (como responsável).
     */
    public function ticketsResponsaveis(): HasMany
    {
        return $this->hasMany(Ticket::class, 'responsavel_id');
    }

    /**
     * Relacionamento: Histórico de alterações de status realizadas por este usuário.
     */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(TicketStatusHistory::class);
    }
}
