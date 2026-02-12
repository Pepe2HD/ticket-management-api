<?php

namespace App\Http\Controllers\Api;

use App\Actions\Tickets\ChangeTicketStatusAction;
use App\Actions\Tickets\CreateTicketAction;
use App\Actions\Tickets\UpdateTicketAction;
use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ChangeTicketStatusRequest;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;

class TicketController extends Controller
{
    public function __construct(
        private readonly CreateTicketAction $createTicketAction,
        private readonly UpdateTicketAction $updateTicketAction,
        private readonly ChangeTicketStatusAction $changeTicketStatusAction
    ) {
    }
    /**
     * Lista todos os tickets com filtros opcionais.
     * 
     * Admin: vê todos os tickets
     * Usuário comum: vê apenas tickets que criou ou é responsável
     * 
     * Filtros: status, prioridade
     * Ordenação: created_at DESC
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Ticket::class);

        Log::info('Listando tickets', [
            'user_id' => $request->user()->id,
            'filters' => $request->only(['status', 'prioridade', 'q']),
        ]);

        $query = Ticket::query()->with(['solicitante', 'responsavel']);

        // Filtro por visibilidade: admin vê todos, usuário comum vê apenas os seus
        if (!auth()->user()->is_admin) {
            $query->where(function ($q) {
                $q->where('solicitante_id', auth()->id())
                  ->orWhere('responsavel_id', auth()->id());
            });
        }

        $tickets = $query
            ->filter($request->only(['status', 'prioridade', 'q']))
            ->orderByStatusPriority()
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return TicketResource::collection($tickets);
    }

    /**
     * Retorna um ticket específico com seus relacionamentos.
     * 
     * Inclui: solicitante, responsável e histórico de status
     */
    public function show(Ticket $ticket): TicketResource
    {
        $this->authorize('view', $ticket);

        // Eager loading dos relacionamentos para evitar N+1
        $ticket->load([
            'solicitante',
            'responsavel',
            'statusHistory.user'
        ]);

        return new TicketResource($ticket);
    }

    /**
     * Cria um novo ticket.
     * 
     * - solicitante_id é automaticamente o usuário autenticado
     * - Status inicial: ABERTO
     * - Usa transaction para garantir atomicidade
     */
    public function store(StoreTicketRequest $request): JsonResponse
    {
        $this->authorize('create', Ticket::class);

        $ticket = $this->createTicketAction->execute(
            $request->validated(),
            auth()->id()
        );

        Log::info('Ticket criado com sucesso', [
            'ticket_id' => $ticket->id,
            'solicitante_id' => $ticket->solicitante_id,
        ]);

        return (new TicketResource($ticket))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Atualiza dados básicos de um ticket.
     * 
     * Campos permitidos: titulo, descricao, prioridade, responsavel_id
     * Não permite mudança de status (use changeStatus)
     * Apenas tickets com status ABERTO podem ser atualizados
     */
    public function update(UpdateTicketRequest $request, Ticket $ticket): TicketResource
    {
        $this->authorize('update', $ticket);

        $ticket = $this->updateTicketAction->execute($ticket, $request->validated());

        Log::info('Ticket atualizado com sucesso', [
            'ticket_id' => $ticket->id,
            'updated_by' => auth()->id(),
        ]);

        return new TicketResource($ticket);
    }

    /**
     * Remove (soft delete) um ticket.
     * 
      * Solicitante pode deletar o próprio ticket, admin pode deletar qualquer ticket
     * Exclusão lógica (soft delete) - dados não são perdidos
     */
    public function destroy(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('delete', $ticket);

        $ticket->delete();

        Log::info('Ticket deletado com sucesso', [
            'ticket_id' => $ticket->id,
            'deleted_by' => auth()->id(),
        ]);

        return response()->json(null, 204);
    }

    /**
     * Altera o status de um ticket (endpoint exclusivo).
     * 
     * APENAS ADMINISTRADORES podem alterar status
     * 
     * Fluxo:
     * 1. Valida novo status
     * 2. Registra mudança no histórico (TicketStatusHistory)
     * 3. Atualiza status do ticket
     * 4. Se status = RESOLVIDO, preenche resolved_at
     * 
     * Retorna ticket atualizado com histórico completo
     */
    public function changeStatus(ChangeTicketStatusRequest $request, Ticket $ticket): TicketResource|JsonResponse
    {
        $this->authorize('changeStatus', $ticket);

        $statusAnterior = $ticket->status;
        $novoStatus = TicketStatus::from($request->status);
        $ticket = $this->changeTicketStatusAction->execute(
            $ticket,
            $novoStatus,
            auth()->id()
        );

        Log::info('Status do ticket alterado com sucesso', [
            'ticket_id' => $ticket->id,
            'status_anterior' => $statusAnterior->value,
            'novo_status' => $novoStatus->value,
            'changed_by' => auth()->id(),
        ]);

        return new TicketResource($ticket);
    }
}
