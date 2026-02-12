# Estrutura de Testes - Tickets API

Esta documentação descreve a organização dos testes de Feature para o módulo de Tickets.

## 📁 Arquivos de Teste

### 1. **TicketAuthenticationTest.php**
Testes relacionados à **autenticação** e proteção de rotas.

**O que testa:**
- ✅ Usuário não autenticado não pode acessar tickets (401)
- ✅ Token inválido retorna erro 401
- ✅ Ticket não encontrado retorna 404

**Quando usar:**
- Adicionar testes quando criar novas rotas protegidas
- Testar diferentes cenários de autenticação

---

### 2. **TicketAuthorizationTest.php**
Testes relacionados a **permissões de acesso** (quem pode fazer o quê).

**O que testa:**
- ✅ Usuário não pode deletar ticket de outro usuário (403)
- ✅ Admin pode deletar qualquer ticket
- ✅ Owner ou admin podem deletar ticket

**Quando usar:**
- Adicionar testes quando criar novas regras de permissão
- Validar políticas (Policies) de autorização

---

### 3. **TicketCrudTest.php**
Testes para operações **CRUD básicas** (Create, Read, Update, Delete).

**O que testa:**
- ✅ Listar tickets autenticado
- ✅ Criar ticket válido
- ✅ Validação de dados obrigatórios
- ✅ Soft delete funciona corretamente
- ✅ Não pode editar ticket que não está ABERTO (403)
- ✅ Pode editar ticket quando status é ABERTO

**Quando usar:**
- Testar criação, leitura, atualização e remoção
- Validar regras de validação de formulários
- Testar restrições de edição por status

---

### 4. **TicketStatusChangeTest.php**
Testes específicos para **mudança de status** de tickets.

**O que testa:**
- ✅ Mudança de status cria log no histórico
- ✅ Campo `resolved_at` é preenchido ao resolver
- ✅ Mesmo status não cria log duplicado
- ✅ Ticket resolvido não pode ter status alterado (422)
- ✅ Não permite retrocesso: EM_ANDAMENTO → ABERTO (422)
- ✅ Não permite retrocesso: RESOLVIDO → EM_ANDAMENTO (422)
- ✅ Permite avanço: ABERTO → EM_ANDAMENTO
- ✅ Permite avanço: EM_ANDAMENTO → RESOLVIDO

**Quando usar:**
- Testar transições de status válidas/inválidas
- Validar hierarquia de status (ABERTO < EM_ANDAMENTO < RESOLVIDO)
- Validar regras de negócio relacionadas a status
- Testar histórico de mudanças

---

### 5. **TicketFilterTest.php**
Testes para **filtros e busca** de tickets.

**O que testa:**
- ✅ Filtrar tickets por status
- ✅ Buscar tickets por título (query string)

**Quando usar:**
- Adicionar novos filtros (prioridade, responsável, etc.)
- Testar busca por diferentes campos
- Validar ordenação e paginação

---

## 🎯 Boas Práticas

### 1. **Um teste, uma responsabilidade**
Cada método de teste deve validar apenas uma funcionalidade específica.

### 2. **Nomenclatura Clara**
Use nomes descritivos: `test_cannot_change_resolved_ticket_status()`

### 3. **Arrange, Act, Assert**
```php
// Arrange - preparar dados
$user = User::factory()->create();

// Act - executar ação
$response = $this->postJson('/api/tickets', $data);

// Assert - validar resultado
$response->assertCreated();
```

### 4. **Usar RefreshDatabase**
Sempre use `use RefreshDatabase;` para garantir banco limpo.

### 5. **Usar Sanctum corretamente**
```php
$this->actingAs($user, 'sanctum');
```

---

## 📊 Estatísticas Atuais

```
Tests:    23 passed (55 assertions)
Duration: ~1.9s

Distribuição:
├── TicketAuthenticationTest   → 3 testes
├── TicketAuthorizationTest    → 3 testes
├── TicketCrudTest             → 6 testes
├── TicketFilterTest           → 2 testes
└── TicketStatusChangeTest     → 7 testes
```

---

## 🚀 Como Executar

```bash
# Todos os testes
php artisan test

# Teste específico
php artisan test --filter=TicketAuthenticationTest

# Teste individual
php artisan test --filter=test_user_can_create_ticket

# Com cobertura
php artisan test --coverage
```

---

## 📝 Quando Adicionar Novos Testes

| Se você for... | Adicione em... |
|---|---|
| Criar nova rota protegida | TicketAuthenticationTest |
| Adicionar nova permissão | TicketAuthorizationTest |
| Criar/editar/deletar tickets | TicketCrudTest |
| Adicionar transição de status | TicketStatusChangeTest |
| Criar novo filtro/busca | TicketFilterTest |

---

**Última atualização:** 12 de fevereiro de 2026
