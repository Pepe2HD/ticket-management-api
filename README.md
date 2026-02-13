# 🎟️ Sistema de Gestão de Chamados (Tickets)

Aplicação **completa** para gestão interna de chamados com autenticação, regras de negócio, auditoria, notificações e API REST.

---

## ⚡ Destaques da Implementação

- ✅ **Autenticação Segura**: Laravel Sanctum com tokens SPA
- ✅ **Autorização**: Policies para controle de acesso granular
- ✅ **API RESTful**: CRUD completo com validações
- ✅ **Paginação**: Listagens paginadas (15 itens por página)
- ✅ **Rate Limiting**: 60 requisições/minuto por usuário
- ✅ **Testes Abrangentes**: 26 testes com 59 assertions
- ✅ **Notificações Assíncronas**: Queue para envio de emails
- ✅ **Docker Ready**: Nginx + MySQL + Queue Worker + Expo (Web/Mobile)
- ✅ **Health Check**: Endpoint `/api/health` para monitoramento
- ✅ **CORS Configurável**: Pronto para integração com frontend

---

## 🧰 Tecnologias Utilizadas

### Backend
- Laravel 10+
- PHP 8.2+
- MySQL/SQLite
- PHPUnit (testes)

### Frontend
- React Native
- Expo
- React Navigation
- Axios
- AsyncStorage

---

## ✨ Diferenciais Técnicos

### Regras de Negócio
- **Atribuição automática:** ao mudar o status para **EM_ANDAMENTO**, o Admin se torna o responsável pelo ticket.
- **Auditoria completa:** mudanças de status são registradas em tabela de logs com timestamp.
- **Processamento assíncrono:** notificações são enviadas via **Queue** ao resolver um ticket.
- **Segurança e permissões:** controle de acesso via **Laravel Policies**.

### Otimizações de Performance
- **Eager Loading**: Previne problema N+1 em relacionamentos
- **Paginação**: 15 itens por página (configurável via parâmetro `per_page`)
- **Índices de banco**: Otimizados para queries frequentes

### Segurança
- **Rate Limiting**: Proteção contra abuso de API (60 req/min)
- **Logs estruturados**: Contexto completo para auditoria
- **CORS**: Configurável por ambiente via variável `CORS_ALLOWED_ORIGINS`

---

## ✅ Requisitos de Sistema

- PHP 8.2+
- Composer
- SQLite ou MySQL
- Extensões PHP: pdo, openssl, mbstring, json, tokenizer
- Docker Desktop (Windows/Mac) para rodar via Docker (se quiser)

---

## 🚀 Instalação e Setup

### Opção 1: Local (Desenvolvimento)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Migrations e Seeds
php artisan migrate --seed

# Rodar API
php artisan serve

# Em outro terminal, rodar fila
php artisan queue:work
```

### Opção 2: Docker (Recomendado)

```bash
# Subir todos os serviços (Nginx, MySQL, Queue Worker e Frontend Expo)
docker compose up -d

# Executar migrações
docker compose exec app php artisan migrate --seed

# Ver logs
docker compose logs -f app

# Testar health check
curl http://localhost:8000/api/health

# Rodar testes (opcional)
docker compose exec app php artisan test
```

Serviços disponíveis:
- **API**: http://localhost:8000
- **MySQL**: localhost:3306
- **Queue Worker**: roda automaticamente
- **Frontend Web (Expo)**: http://localhost:19006
- **Frontend Mobile (Expo Go)**: veja o QR Code nos logs

### Frontend (React Native)

```bash
cd frontend
npm install

# Editar src/services/api.js com URL do backend
# Exemplo: http://localhost:8000
npm start
```

> No Docker, o Expo roda em modo dev server. Para mobile, use o Expo Go e escaneie o QR Code do log:

```bash
docker compose logs -f frontend
```

---

## 📚 Documentação

- **Endpoints da API** - Veja seção [🔌 Endpoints](#-endpoints-principais-api)
- **Testes Automatizados** - Veja seção [🧪 Testes](#-testes)
---

## 🔐 Credenciais de Teste

Após executar `php artisan migrate --seed`:

| Perfil | Email | Senha |
| --- | --- | --- |
| Admin | admin@test.com | password |
| Solicitante | user@test.com | password |

---

## 🔌 Endpoints Principais (API)

### Autenticação
- `POST /api/login` - Autenticar e receber token
- `POST /api/register` - Criar nova conta
- `POST /api/logout` - Encerrar sessão

### Tickets
- `GET /api/tickets` - Listar com filtros (status, priority, per_page, page)
- `GET /api/tickets/{id}` - Ver detalhes
- `POST /api/tickets` - Criar novo ticket
- `PATCH /api/tickets/{id}` - Atualizar (apenas ABERTO)
- `DELETE /api/tickets/{id}` - Excluir (soft delete)
- `PATCH /api/tickets/{id}/status` - Mudar status

### Usuários
- `GET /api/users` - Listar usuários (apenas admin)

### Monitoramento
- `GET /api/health` - Health check (status, timestamp, service)

> Todas as rotas protegidas exigem header: `Authorization: Bearer {token}`

**Rate Limiting**: 60 requisições/minuto por usuário autenticado

---

## 🧪 Testes

```bash
cd backend

# Executar todos os testes
php artisan test

# Com detalhes de cobertura
php artisan test --coverage

# Apenas testes de feature
php artisan test --testsuite=Feature

# Teste específico
php artisan test --filter TicketNotificationTest
```

### Suíte de Testes Disponível

| Arquivo | Responsabilidade | Qtd Testes |
|---------|------------------|------------|
| **TicketAuthenticationTest** | Proteção de rotas, tokens | 3 |
| **TicketAuthorizationTest** | Permissões e policies | 4 |
| **TicketCrudTest** | CRUD básico e validações | 8 |
| **TicketStatusChangeTest** | Mudança de status e regras | 6 |
| **TicketFilterTest** | Filtros e busca | 2 |
| **TicketNotificationTest** | Notificações assíncronas | 3 |

> 📖 Documentação detalhada: [`backend/tests/Feature/TICKET_TESTS_README.md`](./backend/tests/Feature/TICKET_TESTS_README.md)

---

## 🛡️ Segurança

- ✅ Autenticação com tokens (Laravel Sanctum)
- ✅ Autorização com Policies em cada endpoint
- ✅ Validação de entrada com Form Requests
- ✅ Rate Limiting (60 req/min por usuário)
- ✅ CORS configurável por ambiente
- ✅ SQL Injection protection (Eloquent ORM)
- ✅ XSS protection automático
- ✅ CSRF protection

---

## 📊 Performance e Escalabilidade

- ✅ **Eager Loading**: Previne N+1 queries com `with(['solicitante', 'responsavel'])`
- ✅ **Paginação**: Limita carga de memória e tempo de resposta
- ✅ **Índices**: Campos de busca/filtro indexados
- ✅ **Queue Workers**: Processa tarefas pesadas em background

## 🐳 Docker e DevOps

### Estrutura do Docker Compose

```yaml
services:
  app       # Laravel API (PHP-FPM)
  nginx     # Servidor web
  db        # MySQL 8.0
  queue     # Worker de filas
  frontend  # Expo Web (React Native)
```

```bash
# Subir ambiente
docker compose up -d

# Ver logs em tempo real
docker compose logs -f app

# Acessar container
docker compose exec app bash

# Parar tudo
docker compose down

# Rebuild após mudanças no Dockerfile
docker compose up -d --build
```

---

## 🔧 Troubleshooting

### Backend não inicia

```bash
# Limpar caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Verificar permissões
chmod -R 775 storage bootstrap/cache
```

### Notificações não enviadas

```bash
# Verificar se a fila está rodando
php artisan queue:work

# Ver jobs falhados
php artisan queue:failed

# Reprocessar job falhado
php artisan queue:retry {job_id}
```

### Erro de CORS no frontend

Configure `CORS_ALLOWED_ORIGINS` no `.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:19006,http://localhost:3000
```

### Banco de dados no Docker

SQLite é usado por padrão. Para MySQL via Docker:

```bash
docker compose up -d
```

---

## 📁 Estrutura do Projeto

```text
ticket-management-api/
├── backend/              # API Laravel
│   ├── app/
│   │   ├── Actions/      # Lógica de negócio isolada
│   │   ├── Enums/        # Status e prioridades tipados
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Requests/    # Validações
│   │   │   └── Resources/   # Transformação JSON
│   │   ├── Models/
│   │   ├── Notifications/
│   │   └── Policies/     # Autorização granular
│   ├── database/
│   │   ├── factories/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php       # Rotas REST
│   ├── tests/
│   │   └── Feature/      # 26 testes automatizados
│   └── Dockerfile
├── frontend/             # App React Native
│   ├── src/
│   │   ├── components/
│   │   ├── context/      # Auth + Theme
│   │   ├── navigation/
│   │   ├── screens/
│   │   └── services/     # Cliente API
│   └── package.json
├── docker/
│   └── nginx/
│       └── default.conf  # Configuração Nginx
├── docker-compose.yml
└── README.md
```

---

## 🚢 Deploy em Produção

Para produção, considere:

- Configurar `APP_ENV=production` e `APP_DEBUG=false`
- Usar MySQL em servidor dedicado
- Configurar SMTP para notificações por email
- Definir `CORS_ALLOWED_ORIGINS` com domínios permitidos
- Executar `php artisan config:cache` e `php artisan route:cache`
- Configurar SSL com Let's Encrypt
- Backup automático do banco de dados

---

## 💬 Nota do Desenvolvedor

> **Sobre o Escopo deste Projeto**
>
> Este projeto foi desenvolvido como parte de um desafio técnico. Embora os requisitos básicos 
> fossem CRUD + autenticação + testes, eu **intencionalmente** adicionei funcionalidades extras para demonstrar:
> 
> - 📚 Vontade de aprender e ir além do mínimo esperado
> - 🔍 Pesquisa sobre boas práticas (paginação, rate limiting, CORS)
> - 🐳 Interesse em DevOps e facilidade de setup (Docker)
> - ✅ Comprometimento com qualidade (testes, documentação)
> 
> **Tempo total investido**: ~10-12 horas (incluindo pesquisa e documentação)
> 
> ⚠️ **Estou aberto a feedback!** Como desenvolvedor em início de carreira, toda crítica construtiva 
> sobre arquitetura, código ou decisões técnicas será muito bem-vinda e valorizada.

---

## 📈 Avaliação do Projeto

### Requisitos Obrigatórios Atendidos ✅
- ✅ CRUD completo de tickets
- ✅ Autenticação e autorização
- ✅ Mudança de status com regras de negócio
- ✅ Histórico de mudanças auditável
- ✅ Testes automatizados abrangentes
- ✅ API REST bem estruturada

### Extras Implementados 🌟
- ✅ Paginação (essencial para qualquer API)
- ✅ Rate limiting (segurança básica)
- ✅ Health check (monitoramento)
- ✅ Docker Compose (facilita desenvolvimento)
- ✅ CORS configurável (integração com frontend)
- ✅ Documentação detalhada

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autor

Desenvolvido como parte de um desafio técnico para demonstrar boas práticas de desenvolvimento Laravel e React Native com foco em **código limpo, testável e pronto para produção**.

---

**Última atualização**: Fevereiro 2024
