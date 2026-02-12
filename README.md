# 🎟️ Sistema de Gestão de Chamados (Tickets)

Aplicação para **gestão interna de chamados** com autenticação, regras de negócio, auditoria e API REST. O foco do projeto é entregar um back-end robusto, seguro e fácil de rodar.

---

## 🧰 Tecnologias Utilizadas

- Laravel 10+
- PHP 8.x
- Banco de dados: SQLite (padrão) ou MySQL
- Filas (Queues) para processamento assíncrono
- Policies para autorização (Admin vs Solicitante)
- API Resources para padronização das respostas
- Form Requests para validação server-side

---

## ✨ Diferenciais Técnicos

- **Atribuição automática:** ao mudar o status para **EM_ANDAMENTO**, o Admin se torna o responsável pelo ticket.
- **Auditoria completa:** mudanças de status são registradas em tabela de logs.
- **Processamento assíncrono:** notificações são enviadas via **Queue** ao resolver um ticket.
- **Segurança e permissões:** controle de acesso via **Laravel Policies**.

---

## ✅ Requisitos de Sistema

- PHP 8.x
- Composer
- Extensões PHP comuns para Laravel (pdo, sqlite, openssl, mbstring, json, tokenizer)

---

## 🚀 Instalação e Setup (Backend)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### Migrations e Seeds

```bash
php artisan migrate --seed
```

### Rodar a API

```bash
php artisan serve
```

### Rodar a Fila (Queue)

```bash
php artisan queue:work
```

---

## 📱 Frontend (React Native)

```bash
cd frontend
npm install
npm run start
```

> O app Expo sera aberto no navegador e voce pode rodar no emulador ou no dispositivo fisico (Via aplicativo Expo Go por URL ou QR Code).

---

## 🔐 Credenciais de Teste

| Perfil | Email | Senha |
| --- | --- | --- |
| Admin | admin@test.com | password |
| Solicitante | user@test.com | password |

---

## 🔌 Endpoints Principais (API)

- `GET /api/tickets` - Listagem (Filtros: `status`, `prioridade`, `search`)
- `POST /api/tickets` - Criação (Validação: 5-120 caracteres para título)
- `PATCH /api/tickets/{id}/status` - Atualização de status e atribuição de responsável
- `DELETE /api/tickets/{id}` - Remoção lógica (Soft Delete)

> Todas as rotas estao protegidas por autenticacao (Sanctum/token).

---

## 🧪 Testes

```bash
php artisan test
```

### Testes de Feature Disponíveis:

| Arquivo | Responsabilidade | Testes |
|---------|------------------|--------|
| **TicketAuthenticationTest** | Proteção de rotas e autenticação | 401 para não autenticados, token inválido, 404 para recursos inexistentes |
| **TicketAuthorizationTest** | Permissões e políticas de acesso | Admin deleta qualquer ticket, usuário não deleta ticket de outro (403) |
| **TicketCrudTest** | Operações CRUD básicas | Criar, listar, validar dados obrigatórios, soft delete |
| **TicketStatusChangeTest** | Mudança de status e regras de negócio | Histórico de mudanças, `resolved_at`, impedir alteração de ticket resolvido (422) |
| **TicketFilterTest** | Filtros e busca | Filtrar por status, buscar por título |

**Total: 17 testes com 38 assertions**

> 📖 Documentação completa dos testes: [`backend/tests/Feature/TICKET_TESTS_README.md`](backend/tests/Feature/TICKET_TESTS_README.md)

---

## 📁 Estrutura do Projeto

```text
.
├── backend/    # API Laravel
├── frontend/   # App React Native (Expo)
└── README.md
```
