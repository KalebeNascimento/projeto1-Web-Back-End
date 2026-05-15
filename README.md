# 🍳 Portfólio de Receitas Culinárias

Aplicação web desenvolvida como Projeto 1 da disciplina **Programação Web Back-End** do curso de Bacharelado em Engenharia de Software da **UTFPR – Campus Cornélio Procópio**.

> Profª. Dra. Tatanne C. N. Rocha

---

## 📋 Sobre o Projeto

O sistema funciona como um **portfólio web de receitas culinárias** cadastradas por alunos. Integra dois bancos de dados — **SQLite** (relacional) e **MongoDB** (não relacional) — em uma mesma aplicação, seguindo o padrão arquitetural MVC.

Permite que alunos criem e organizem receitas, associem-nas a categorias, registrem habilidades culinárias com níveis de domínio, colaborem em receitas com outros alunos e recebam comentários do público via MongoDB.

---

## 🚀 Tecnologias Utilizadas

### Back-End
| Tecnologia | Descrição |
|---|---|
| **Node.js** | Ambiente de execução JavaScript |
| **Express** | Framework web |
| **EJS** | Template engine para as views |
| **better-sqlite3** | Banco de dados relacional SQLite (dados principais) |
| **Mongoose** | ODM para MongoDB (comentários) |
| **bcryptjs** | Hash seguro de senhas |
| **express-session** | Gerenciamento de sessões |
| **connect-flash** | Mensagens de feedback ao usuário |
| **method-override** | Suporte a PUT e DELETE em formulários HTML |

### Documentação da API
| Tecnologia | Descrição |
|---|---|
| **swagger-jsdoc** | Geração automática da especificação OpenAPI a partir de JSDoc |
| **swagger-ui-express** | Interface visual para testar os endpoints da API |

---

## 🏗️ Arquitetura MVC

```
projeto1-Web-Back-End/
├── app.js                            # Ponto de entrada da aplicação
├── package.json
├── public/
│   └── css/
│       └── style.css                 # Estilos globais
└── src/
    ├── config/
    │   ├── database.js               # Conexão e inicialização do banco SQLite
    │   ├── mongodb.js                # Conexão com MongoDB
    │   └── swagger.js                # Configuração do Swagger/OpenAPI
    ├── controllers/
    │   ├── authController.js         # Login e logout
    │   ├── adminController.js        # Gestão de alunos, categorias e habilidades
    │   ├── alunoController.js        # Receitas e habilidades do aluno
    │   ├── publicController.js       # Páginas públicas e relatório
    │   └── comentarioController.js   # Comentários via MongoDB
    ├── middlewares/
    │   └── auth.js                   # Proteção de rotas por perfil
    ├── models/
    │   ├── Aluno.js                  # Model SQLite
    │   ├── Receita.js                # Model SQLite
    │   ├── Categoria.js              # Model SQLite
    │   ├── Habilidade.js             # Model SQLite
    │   └── Comentario.js             # Model Mongoose (MongoDB)
    ├── routes/
    │   ├── auth.js
    │   ├── admin.js
    │   ├── aluno.js
    │   ├── public.js
    │   └── api.js                    # REST API com documentação Swagger
    └── views/
        ├── partials/                 # Header e footer reutilizáveis
        ├── auth/                     # Tela de login
        ├── admin/                    # Painel administrativo
        ├── aluno/                    # Área do aluno
        └── public/                   # Páginas públicas e detalhe de receita
```

---

## 🗄️ Modelagem dos Bancos de Dados

### SQLite — Dados Relacionais

```
alunos ─────────────────────── receitas
  │                               │    │
  │  (N:N via aluno_habilidade)   │    │  (N:N via receita_categoria)
  │                               │    │
habilidades               receita_aluno     categorias
                          (N:N co-autores)
```

| Tabela | Descrição |
|---|---|
| `alunos` | Usuários do sistema (alunos e admin) |
| `receitas` | Receitas cadastradas com campo `criado_por` |
| `categorias` | Categorias disponíveis para as receitas |
| `habilidades` | Habilidades culinárias disponíveis |
| `receita_categoria` | N:N — receita ↔ categoria |
| `receita_aluno` | N:N — receita ↔ aluno (co-autores/responsáveis) |
| `aluno_habilidade` | N:N — aluno ↔ habilidade (com nível 0–10) |

### MongoDB — Dados Não Relacionais

```javascript
// Collection: comentarios
{
  receita_id:  Number,   // referência ao ID da receita no SQLite
  autor_nome:  String,   // nome do autor do comentário
  conteudo:    String,   // texto do comentário
  created_at:  Date      // gerado automaticamente
}
```

---

## ⚙️ Instalação e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- [MongoDB Community](https://www.mongodb.com/try/download/community) instalado e rodando

### Passo a passo

**1. Clone o repositório**
```bash
git clone <url-do-repositorio>
cd projeto1-Web-Back-End
```

**2. Instale as dependências**
```bash
npm install
```

**3. Inicie o MongoDB** (caso não esteja rodando como serviço do Windows)
```bash
mongod
```

**4. Inicie o servidor**
```bash
npm start
```

**5. Acesse no navegador**

| URL | Descrição |
|---|---|
| `http://localhost:3000` | Portfólio público |
| `http://localhost:3000/login` | Login |
| `http://localhost:3000/api-docs` | Swagger UI |

> O banco SQLite (`database.db`) é criado automaticamente na primeira execução com dados iniciais.
> Se o MongoDB estiver offline, a aplicação continua funcionando normalmente — apenas os comentários ficam indisponíveis.

---

## 👤 Credenciais Iniciais

| Perfil | E-mail | Senha |
|---|---|---|
| **Administrador** | `admin@portfolio.com` | `admin123` |

> Novos alunos só podem ser cadastrados pelo administrador.

---

## 📌 Funcionalidades

### 🌐 Área Pública (sem login)

- Visualizar todas as receitas cadastradas
- Filtrar receitas por categoria
- Ver detalhes de uma receita (descrição, co-autores, categorias)
- **Comentar em receitas** (persistido no MongoDB)
- Relatório com a proporção de alunos que dominam cada habilidade e nível médio

### 🎓 Área do Aluno (com login)

- **Receitas:** cadastrar, editar e excluir receitas (nome, descrição, link externo)
- **Categorias:** vincular múltiplas categorias a cada receita (N:N)
- **Co-autores:** adicionar outros alunos como responsáveis (N:N) — todos podem editar
- **Habilidades:** adicionar, editar nível (0–10) e remover habilidades culinárias

### 🔧 Área do Administrador (com login)

- **Alunos:** cadastrar, listar, editar e excluir alunos
- **Categorias:** cadastrar, listar, editar e excluir categorias
- **Habilidades:** cadastrar, listar, editar e excluir habilidades
- **Comentários:** excluir comentários inadequados nas receitas

---

## 🔗 Rotas da Aplicação Web

### Públicas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Listagem de todas as receitas |
| GET | `/categorias/:id/receitas` | Receitas filtradas por categoria |
| GET | `/receitas/:id` | Detalhe da receita com comentários |
| POST | `/receitas/:id/comentarios` | Publicar comentário (MongoDB) |
| POST | `/receitas/:id/comentarios/:cId/excluir` | Excluir comentário (admin) |
| GET | `/relatorio` | Relatório de habilidades |
| GET | `/login` | Tela de login |
| POST | `/login` | Processar login |
| GET | `/logout` | Encerrar sessão |

### Aluno (`/aluno`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/aluno` | Painel do aluno |
| GET | `/aluno/receitas` | Listar receitas |
| GET | `/aluno/receitas/nova` | Formulário de nova receita |
| POST | `/aluno/receitas` | Criar receita |
| GET | `/aluno/receitas/:id/editar` | Formulário de edição |
| PUT | `/aluno/receitas/:id` | Atualizar receita |
| DELETE | `/aluno/receitas/:id` | Excluir receita |
| GET | `/aluno/habilidades` | Gerenciar habilidades |
| POST | `/aluno/habilidades` | Adicionar habilidade |
| POST | `/aluno/habilidades/:id/editar` | Atualizar nível |
| DELETE | `/aluno/habilidades/:id` | Remover habilidade |

### Administrador (`/admin`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin` | Painel administrativo |
| GET/POST | `/admin/alunos` | Listar / Criar aluno |
| GET | `/admin/alunos/novo` | Formulário de novo aluno |
| GET/PUT/DELETE | `/admin/alunos/:id` | Editar / Excluir aluno |
| GET/POST | `/admin/categorias` | Listar / Criar categoria |
| GET/PUT/DELETE | `/admin/categorias/:id` | Editar / Excluir categoria |
| GET/POST | `/admin/habilidades` | Listar / Criar habilidade |
| GET/PUT/DELETE | `/admin/habilidades/:id` | Editar / Excluir habilidade |

---

## 📡 REST API — Swagger UI

A aplicação disponibiliza uma REST API completa com documentação interativa.

**Acesse:** `http://localhost:3000/api-docs`

### Como usar o Swagger

1. Abra `http://localhost:3000/api-docs`
2. Expanda **`POST /api/v1/auth/login`** e execute com suas credenciais
3. A sessão é mantida automaticamente via cookie — todos os endpoints ficam liberados

### Grupos de endpoints

| Grupo | Descrição |
|---|---|
| **Auth** | Login, logout, usuário atual |
| **Público** | Listar receitas, filtrar, relatório |
| **Receitas** | CRUD de receitas do aluno logado |
| **Habilidades do Aluno** | Gerenciar habilidades com nível |
| **Admin – Alunos** | CRUD completo de alunos |
| **Admin – Categorias** | CRUD de categorias |
| **Admin – Habilidades** | CRUD de habilidades |

---

## 🔒 Segurança

- Senhas armazenadas com hash **bcrypt** (salt rounds: 10)
- Sessões com secret e expiração de 8 horas
- Middleware de autenticação protegendo todas as rotas privadas
- Validação de propriedade antes de editar/excluir receitas
- Foreign keys habilitadas no SQLite (`PRAGMA foreign_keys = ON`)
- Validação de campos obrigatórios em todos os controllers

---

## 📦 Dados Iniciais (Seed)

Gerados automaticamente na primeira execução do servidor:

**Categorias:** Sobremesas, Pratos Principais, Entradas, Bebidas, Lanches, Saladas

**Habilidades:** Confeitaria, Grelhados, Massas, Frutos do Mar, Vegetariano, Panificação

**Usuário admin:** `admin@portfolio.com` / `admin123`

---

## 👨‍💻 Autor

Desenvolvido para a disciplina de **Programação Web Back-End** — UTFPR Campus Cornélio Procópio.
