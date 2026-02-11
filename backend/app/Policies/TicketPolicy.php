<?php

namespace App\Policies;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{

    private function isAdmin(User $user): bool
    {
        return $user->is_admin;
    }

    /**
     * Determina se o usuário pode ver qualquer ticket.
     * 
     * Qualquer usuário autenticado pode listar tickets.
     * A filtragem (próprios vs. todos) é tratada no controller.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determina se o usuário pode visualizar um ticket específico.
     * 
     * Permite se:
     * - for o solicitante do ticket OU
     * - for o responsável pelo ticket OU
     * - for administrador
     */
    public function view(User $user, Ticket $ticket): bool
    {
        return $user->id === $ticket->solicitante_id
            || $user->id === $ticket->responsavel_id
            || $this->isAdmin($user);;
    }

    /**
     * Determina se o usuário pode criar um ticket.
     * 
     * Qualquer usuário autenticado pode criar tickets.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determina se o usuário pode atualizar um ticket.
     * 
     * Permite se:
     * - for o solicitante OU admin
     * - E o ticket estiver com status ABERTO
     * 
     * Impede atualizações em tickets já em andamento ou resolvidos.
     */
    public function update(User $user, Ticket $ticket): bool
    {
        // Verifica se o usuário é autenticado e tem permissão
        $podeAtualizar = $user->id === $ticket->solicitante_id || $this->isAdmin($user);

        // Permite atualização apenas se o ticket está ABERTO
        return $podeAtualizar && $ticket->status === TicketStatus::ABERTO;
    }

    /**
     * Determina se o usuário pode deletar/cancelar um ticket.
     * 
     * Permite se:
     * - for o solicitante OU admin
     * 
     * Soft delete: tickets podem ser recuperados logicamente.
     */
    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->id === $ticket->solicitante_id || $this->isAdmin($user);
    }

    /**
     * Determina se o usuário pode alterar o status de um ticket.
     * 
     * Apenas administradores podem alterar o status.
     * Esta é uma ação sensível que requer privilégios elevados.
     */
    public function changeStatus(User $user, Ticket $ticket): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Determina se o usuário pode restaurar um ticket deletado.
     * 
     * Apenas administradores podem restaurar tickets (soft delete).
     */
    public function restore(User $user, Ticket $ticket): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Determina se o usuário pode deletar permanentemente um ticket.
     * 
     * Apenas administradores podem fazer hard delete.
     */
    public function forceDelete(User $user, Ticket $ticket): bool
    {
        return $this->isAdmin($user);
    }
}
