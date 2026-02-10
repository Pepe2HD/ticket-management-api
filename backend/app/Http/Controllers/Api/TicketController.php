<?php

namespace App\Http\Controllers\Api;

use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ChangeTicketStatusRequest;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TicketController extends Controller
{
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

        $query = Ticket::with(['solicitante', 'responsavel']);

        // Filtro por visibilidade: admin vê todos, usuário comum vê apenas os seus
        if (!auth()->user()->is_admin) {
            $query->where(function ($q) {
                $q->where('solicitante_id', auth()->id())
                  ->orWhere('responsavel_id', auth()->id());
            });
        }

        // Filtro opcional por status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filtro opcional por prioridade
        if ($request->has('prioridade') && $request->prioridade) {
            $query->where('prioridade', $request->prioridade);
        }

        // Ordenação por data de criação (mais recentes primeiro)
        $tickets = $query->orderBy('created_at', 'desc')->get();

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

        try {
            DB::beginTransaction();

            // Cria o ticket com dados validados
            $ticket = Ticket::create($request->validated());

            // Carrega relacionamentos para retornar completo
            $ticket->load(['solicitante', 'responsavel']);

            DB::commit();

            Log::info('Ticket criado com sucesso', [
                'ticket_id' => $ticket->id,
                'solicitante_id' => $ticket->solicitante_id,
            ]);

            return (new TicketResource($ticket))
                ->response()
                ->setStatusCode(201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao criar ticket', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'message' => 'Erro ao criar ticket. Tente novamente.',
            ], 500);
        }
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

        try {
            DB::beginTransaction();

            // Atualiza apenas campos permitidos pelo FormRequest
            $ticket->update($request->validated());

            // Recarrega relacionamentos
            $ticket->refresh()->load(['solicitante', 'responsavel']);

            DB::commit();

            Log::info('Ticket atualizado com sucesso', [
                'ticket_id' => $ticket->id,
                'updated_by' => auth()->id(),
            ]);

            return new TicketResource($ticket);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao atualizar ticket', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Erro ao atualizar ticket. Tente novamente.',
            ], 500);
        }
    }

    /**
     * Remove (soft delete) um ticket.
     * 
     * Apenas tickets com status ABERTO podem ser deletados
     * Exclusão lógica (soft delete) - dados não são perdidos
     */
    public function destroy(Ticket $ticket): JsonResponse
    {
        $this->authorize('delete', $ticket);

        try {
            DB::beginTransaction();

            $ticket->delete();

            DB::commit();

            Log::info('Ticket deletado com sucesso', [
                'ticket_id' => $ticket->id,
                'deleted_by' => auth()->id(),
            ]);

            return response()->json(null, 204);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao deletar ticket', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Erro ao deletar ticket. Tente novamente.',
            ], 500);
        }
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
    public function changeStatus(ChangeTicketStatusRequest $request, Ticket $ticket): TicketResource
    {
        $this->authorize('changeStatus', $ticket);

        try {
            DB::beginTransaction();

            // Captura o status anterior antes da mudança
            $statusAnterior = $ticket->status;
            $novoStatus = TicketStatus::from($request->status);

            // Registra a mudança no histórico
            TicketStatusHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => auth()->id(),
                'de' => $statusAnterior,
                'para' => $novoStatus,
            ]);

            // Atualiza o ticket com dados validados (inclui resolved_at se aplicável)
            $ticket->update($request->validated());

            // Recarrega ticket com todos os relacionamentos
            $ticket->refresh()->load([
                'solicitante',
                'responsavel',
                'statusHistory.user'
            ]);

            DB::commit();

            Log::info('Status do ticket alterado com sucesso', [
                'ticket_id' => $ticket->id,
                'status_anterior' => $statusAnterior->value,
                'novo_status' => $novoStatus->value,
                'changed_by' => auth()->id(),
            ]);

            return new TicketResource($ticket);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao alterar status do ticket', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Erro ao alterar status. Tente novamente.',
            ], 500);
        }
    }
}
