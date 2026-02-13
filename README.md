# 🎟️ Sistema de Gestão de Chamados (Tickets)

Sistema completo para gestão de tickets com API REST Laravel + Frontend React Native/Expo.

---

## 📋 Índice

- [Tecnologias](#-tecnologias-utilizadas)
- [Funcionalidades](#-funcionalidades)
- [Requisitos](#-requisitos-do-sistema)
- [Instalação Local](#-opção-1-instalação-local)
- [Instalação Docker](#-opção-2-docker)
- [Credenciais de Teste](#-credenciais-de-teste)
- [Endpoints da API](#-endpoints-da-api)
- [Testes](#-testes)

---

## 🧰 Tecnologias Utilizadas

### Backend
- **Laravel 10+** - Framework PHP
- **PHP 8.2+**
- **MySQL 8.0** / SQLite
- **Laravel Sanctum** - Autenticação
- **PHPUnit** - Testes automatizados

### Frontend
- **React Native** - Framework mobile/web
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação
- **Axios** - Cliente HTTP
- **AsyncStorage** - Persistência local

### DevOps
- **Docker** & Docker Compose
- **Nginx** - Servidor web
- **Queue Worker** - Processamento assíncrono

---

## ✨ Funcionalidades

- ✅ **Autenticação JWT** com Laravel Sanctum
- ✅ **CRUD de Tickets** com validações robustas
- ✅ **Sistema de Permissões** (Admin/Usuário)
- ✅ **Mudança de Status** (Aberto → Em Andamento → Resolvido)
- ✅ **Histórico de Alterações** (auditoria completa)
- ✅ **Notificações Assíncronas** via Queue
- ✅ **Paginação** (15 itens/página)
- ✅ **Rate Limiting** (60 req/min)
- ✅ **Health Check** (`/api/health`)
- ✅ **26 Testes Automatizados** com 59 assertions
- ✅ **Frontend Web e Mobile** com Expo

---

## 📋 Requisitos do Sistema

### Para instalação local:
- **PHP 8.2+** com extensões: `pdo`, `openssl`, `mbstring`, `json`, `tokenizer`
- **Composer** 2.x
- **Node.js 18+** e **npm**
- **SQLite** (desenvolvimento) ou **MySQL 8.0+** (produção)

### Para instalação via Docker:
- **Docker Desktop** (Windows/Mac/Linux)
- **Docker Compose** 2.x

---

## 🚀 Opção 1: Instalação Local

### 1.1. Backend (Laravel API)

```bash
# Navegar para o diretório do backend
cd backend

# Instalar dependências do PHP
composer install

# Configurar variáveis de ambiente
cp .env.example .env

# Gerar chave da aplicação
php artisan key:generate

# Configurar banco de dados (SQLite por padrão)
# O arquivo .env já está configurado para SQLite
# Para MySQL, edite as variáveis DB_* no .env

# Executar migrações e seeds (criar tabelas e usuários de teste)
php artisan migrate --seed

# Iniciar servidor de desenvolvimento
php artisan serve
# API disponível em: http://localhost:8000
```

**Em outro terminal**, iniciar o worker de filas:

```bash
cd backend
php artisan queue:work
```

**Testar a API:**

```bash
# Health check
curl http://localhost:8000/api/health

# Ou no PowerShell:
Invoke-RestMethod -Uri "http://localhost:8000/api/health"
```

### 1.2. Frontend (React Native/Expo)

```bash
# Navegar para o diretório do frontend
cd frontend

# Instalar dependências
npm install

# Configurar URL da API
# Edite o arquivo: src/services/api.js
# Altere baseURL para: http://localhost:8000/api

# Iniciar Expo
npm start
# ou
npx expo start
```

**Opções de visualização:**

- **🌐 Web**: Pressione `w` no terminal ou acesse http://localhost:8081
- **📱 Mobile (Android)**: Pressione `a` ou escaneie o QR code com Expo Go
- **📱 Mobile (iOS)**: Pressione `i` ou escaneie com a câmera do iPhone

---

## 🐳 Opção 2: Docker

Ambiente completo com Nginx, MySQL, Queue Worker e Frontend Expo pré-configurados.

```bash
# Subir todos os serviços
docker compose up -d

# Executar migrações e criar usuários de teste
docker compose exec app php artisan migrate --seed

# Verificar se os containers estão rodando
docker ps
```

**Serviços disponíveis:**

| Serviço | URL/Porta | Descrição |
|---------|-----------|-----------|
| **API Backend** | http://localhost:8000 | Laravel API REST |
| **Frontend Web** | http://localhost:8081 | Expo Web |
| **MySQL** | localhost:3306 | Banco de dados |
| **Queue Worker** | - | Processa jobs em background |

**Comandos úteis:**

```bash
# Ver logs da API
docker compose logs -f app

# Ver logs do frontend
docker compose logs -f frontend

# Rodar testes
docker compose exec app php artisan test

# Acessar container da API
docker compose exec app bash

# Parar todos os serviços
docker compose down

# Rebuild após mudanças no Dockerfile
docker compose up -d --build
```

---

## 🔐 Credenciais de Teste

Após executar `php artisan migrate --seed`, use estas credenciais:

| Perfil | Email | Senha | Permissões |
|--------|-------|-------|------------|
| **Admin** | admin@test.com | password | Pode atribuir tickets e mudar status |
| **Usuário** | user@test.com | password | Pode criar e visualizar seus tickets |

---

## 🔌 Endpoints da API

## 🔌 Endpoints da API

**Base URL:** `http://localhost:8000/api`

> ⚠️ Rotas protegidas requerem header: `Authorization: Bearer {token}`

### Autenticação (públicas)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/login` | Fazer login e receber token |
| POST | `/api/register` | Criar nova conta |
| POST | `/api/logout` | Encerrar sessão (autenticado) |

### Tickets (protegidas)

| Método | Endpoint | Descrição | Parâmetros |
|--------|----------|-----------|------------|
| GET | `/api/tickets` | Listar tickets | `?status=ABERTO&priority=ALTA&per_page=15&page=1` |
| GET | `/api/tickets/{id}` | Ver detalhes de um ticket | - |
| POST | `/api/tickets` | Criar novo ticket | `title`, `description`, `priority` |
| PATCH | `/api/tickets/{id}` | Atualizar ticket (só se ABERTO) | `title`, `description`, `priority` |
| DELETE | `/api/tickets/{id}` | Excluir ticket (soft delete) | - |
| PATCH | `/api/tickets/{id}/status` | Mudar status | `status` (ABERTO, EM_ANDAMENTO, RESOLVIDO) |

### Usuários (admin apenas)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users` | Listar todos os usuários |

### Monitoramento (pública)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check do sistema |

**Rate Limiting:** 60 requisições/minuto por usuário autenticado

**Exemplo de requisição:**

```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Criar ticket (com token)
curl -X POST http://localhost:8000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {seu_token}" \
  -d '{"title":"Problema no login","description":"Erro ao autenticar","priority":"ALTA"}'
```

---

## 🧪 Testes

### Executar testes

```bash
# Local
cd backend
php artisan test

# Docker
docker compose exec app php artisan test

# Com cobertura
php artisan test --coverage

# Teste específico
php artisan test --filter TicketCrudTest
```

### Suíte de testes (26 testes, 59 assertions)

| Arquivo | Responsabilidade | Testes |
|---------|------------------|--------|
| **TicketAuthenticationTest** | Proteção de rotas e tokens | 3 |
| **TicketAuthorizationTest** | Permissões (Policies) | 4 |
| **TicketCrudTest** | CRUD e validações | 8 |
| **TicketStatusChangeTest** | Mudança de status e regras | 6 |
| **TicketFilterTest** | Filtros e paginação | 2 |
| **TicketNotificationTest** | Notificações assíncronas | 3 |

📖 **Documentação completa:** [backend/tests/Feature/TICKET_TESTS_README.md](./backend/tests/Feature/TICKET_TESTS_README.md)

---

## 🎯 Regras de Negócio Implementadas

1. **Atribuição Automática**: Ao mudar status para `EM_ANDAMENTO`, o admin responsável é automaticamente atribuído ao ticket
2. **Auditoria Completa**: Todas as mudanças de status são registradas na tabela `ticket_status_histories` com timestamp
3. **Notificações Assíncronas**: Emails são enviados via Queue quando um ticket é resolvido
4. **Permissões Granulares**: Políticas (Policies) controlam quem pode ver, editar ou deletar cada ticket
5. **Validações Robustas**: Form Requests validam todos os dados de entrada

---

## 🛡️ Segurança

- ✅ Autenticação JWT com Laravel Sanctum
- ✅ Autorização via Policies
- ✅ Validação de entrada (Form Requests)
- ✅ Rate Limiting (60 req/min)
- ✅ CORS configurável (`.env`: `CORS_ALLOWED_ORIGINS`)
- ✅ SQL Injection protection (Eloquent ORM)
- ✅ XSS protection (sanitização automática)
- ✅ CSRF protection

---

## 📊 Otimizações de Performance

- **Eager Loading**: Previne N+1 queries (`->with(['solicitante', 'responsavel'])`)
- **Paginação**: 15 itens/página (configurável: `?per_page=20`)
- **Índices**: Campos de busca otimizados no banco
- **Queue Workers**: Tarefas pesadas processadas em background
- **Cache**: Rotas e configs em cache (produção)

---

## 📁 Estrutura do Projeto

```
ticket-management-api/
├── backend/                    # API Laravel
│   ├── app/
│   │   ├── Actions/           # Lógica de negócio isolada
│   │   ├── Enums/             # Status e Prioridades (tipagem)
│   │   ├── Http/
│   │   │   ├── Controllers/   # Controladores REST
│   │   │   ├── Requests/      # Validações
│   │   │   └── Resources/     # Transformação JSON (API Resources)
│   │   ├── Models/            # Eloquent Models
│   │   ├── Notifications/     # Emails assíncronos
│   │   └── Policies/          # Autorização granular
│   ├── database/
│   │   ├── factories/         # Factories para testes
│   │   ├── migrations/        # Schema do banco
│   │   └── seeders/           # Dados iniciais
│   ├── routes/api.php         # Definição de rotas REST
│   ├── tests/Feature/         # 26 testes automatizados
│   └── Dockerfile
│
├── frontend/                   # React Native/Expo
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── context/           # Auth e Theme Context
│   │   ├── navigation/        # React Navigation
│   │   ├── screens/           # Telas da aplicação
│   │   ├── services/          # Cliente API (Axios)
│   │   └── styles/            # Estilos globais
│   ├── App.js
│   ├── package.json
│   └── Dockerfile
│
├── docker/
│   └── nginx/
│       └── default.conf       # Config Nginx
│
├── docker-compose.yml         # Orquestração Docker
└── README.md
```

---

## 🔧 Troubleshooting (Resolução de Problemas)

### Backend não inicia

```bash
# Limpar caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Verificar permissões (Linux/Mac)
chmod -R 775 storage bootstrap/cache

# Verificar se a porta 8000 está em uso
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac
```

### Notificações não são enviadas

```bash
# Verificar se o queue worker está rodando
php artisan queue:work

# Ver jobs que falharam
php artisan queue:failed

# Reprocessar job falhado
php artisan queue:retry {job_id}

# Reprocessar todos
php artisan queue:retry all
```

### Erro de CORS no frontend

Configure `CORS_ALLOWED_ORIGINS` no arquivo `.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006
```

Depois reinicie o servidor:

```bash
php artisan config:clear
php artisan serve
```

### Frontend não conecta na API

Verifique o arquivo `frontend/src/services/api.js`:

```javascript
// Para desenvolvimento local
const api = axios.create({
  baseURL: 'http://localhost:8000/api'  // Backend local
});

// Para Docker (frontend no container)
const api = axios.create({
  baseURL: 'http://host.docker.internal:8000/api'  // Backend no host
});
```

---

## 🚀 Deploy em Produção

### Checklist de produção

- [ ] Configurar `APP_ENV=production`
- [ ] Desabilitar debug: `APP_DEBUG=false`
- [ ] Configurar banco MySQL dedicado
- [ ] Configurar SMTP para emails (`.env`: `MAIL_*`)
- [ ] Definir domínios permitidos: `CORS_ALLOWED_ORIGINS`
- [ ] Gerar chave forte: `APP_KEY`
- [ ] Otimizar Laravel:
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  ```
- [ ] Configurar SSL/HTTPS (Let's Encrypt)
- [ ] Configurar backup automático do banco
- [ ] Monitorar logs: `storage/logs/laravel.log`
- [ ] Configurar supervisor para queue workers

### Exemplo de configuração Nginx (produção)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## 📝 Notas do Desenvolvedor

> **Sobre este projeto**
>
> Este sistema foi desenvolvido como desafio técnico, demonstrando:
>
> - 🏗️ **Arquitetura limpa**: Separation of Concerns (Controllers, Actions, Policies)
> - ✅ **Qualidade de código**: PSR-12, testes automatizados, documentação
> - 🔒 **Segurança**: Autenticação, autorização, validações, rate limiting
> - 📦 **DevOps**: Docker, fácil setup, ambiente reproduzível
> - 📚 **Boas práticas Laravel**: API Resources, Form Requests, Policies, Queues
>
> **Tempo de desenvolvimento:** ~10-12 horas
>
> **Feedback é bem-vindo!** 🙏 Como desenvolvedor sempre em aprendizado, críticas construtivas sobre arquitetura, código ou decisões técnicas são muito valiosas.

---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se livre para usar, modificar e distribuir.

---

**Última atualização:** Fevereiro 2026
