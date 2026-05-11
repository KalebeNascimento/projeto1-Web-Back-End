# 🍳 Portfólio de Receitas Culinárias

Aplicação web desenvolvida como Projeto 1 da disciplina **Programação Web Back-End** do curso de Bacharelado em Engenharia de Software da **UTFPR – Campus Cornélio Procópio**.

> Profª. Dra. Tatanne C. N. Rocha

---

## 📋 Sobre o Projeto

O sistema funciona como um **portfólio web de receitas culinárias** cadastradas por alunos. Permite que alunos criem e organizem receitas, associem-nas a categorias, registrem habilidades culinárias com níveis de domínio e colaborem em receitas com outros alunos.

---

## 🚀 Tecnologias Utilizadas

| Tecnologia | Descrição |
|---|---|
| **Node.js** | Ambiente de execução JavaScript |
| **Express** | Framework web |
| **EJS** | Template engine para as views |
| **SQLite** (better-sqlite3) | Banco de dados relacional embutido |
| **bcryptjs** | Hash seguro de senhas |
| **express-session** | Gerenciamento de sessões |
| **connect-flash** | Mensagens de feedback ao usuário |
| **method-override** | Suporte a PUT e DELETE em formulários HTML |

---

## 🏗️ Arquitetura MVC

```
projeto1-Web-Back-End/
├── app.js                        # Ponto de entrada da aplicação
├── package.json
├── public/
│   └── css/
│       └── style.css             # Estilos globais
└── src/
    ├── config/
    │   └── database.js           # Conexão e inicialização do banco SQLite
    ├── controllers/
    │   ├── authController.js     # Login e logout
    │   ├── adminController.js    # Gestão de alunos, categorias e habilidades
    │   ├── alunoController.js    # Receitas e habilidades do aluno
    │   └── publicController.js  # Páginas públicas e relatório
    ├── middlewares/
    │   └── auth.js               # Proteção de rotas por perfil
    ├── models/
    │   ├── Aluno.js
    │   ├── Receita.js
    │   ├── Categoria.js
    │   └── Habilidade.js
    ├── routes/
    │   ├── auth.js
    │   ├── admin.js
    │   ├── aluno.js
    │   └── public.js
    └── views/
        ├── partials/             # Header e footer reutilizáveis
        ├── auth/                 # Tela de login
        ├── admin/                # Painel administrativo
        ├── aluno/                # Área do aluno
        └── public/               # Páginas públicas
```

---

## 🗄️ Modelagem do Banco de Dados

```
alunos ────────────────────── receitas
  │                              │   │
  │  (N:N via aluno_habilidade)  │   │  (N:N via receita_categoria)
  │                              │   │
habilidades              receita_aluno    categorias
                         (N:N co-autores)
```

### Tabelas

| Tabela | Descrição |
|---|---|
| `alunos` | Usuários do sistema (alunos e admin) |
| `receitas` | Receitas cadastradas |
| `categorias` | Categorias disponíveis |
| `habilidades` | Habilidades culinárias disponíveis |
| `receita_categoria` | N:N — receita ↔ categoria |
| `receita_aluno` | N:N — receita ↔ aluno (co-autores) |
| `aluno_habilidade` | N:N — aluno ↔ habilidade (com nível 0–10) |

---

## ⚙️ Instalação e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- npm (já vem junto com o Node.js)

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

**3. Inicie o servidor**
```bash
npm start
```

**4. Acesse no navegador**
```
http://localhost:3000
```

> O banco de dados SQLite (`database.db`) é criado automaticamente na primeira execução, já com dados iniciais (categorias, habilidades e o usuário administrador).

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
- Relatório com a proporção de alunos que dominam cada habilidade e nível médio

### 🎓 Área do Aluno (com login)

- **Receitas:** cadastrar, editar e excluir receitas com nome, descrição e link externo
- **Categorias:** vincular múltiplas categorias a cada receita (N:N)
- **Co-autores:** adicionar outros alunos como responsáveis pela receita (N:N) — todos podem editar
- **Habilidades:** adicionar, editar nível (0–10) e remover habilidades culinárias

### 🔧 Área do Administrador (com login)

- **Alunos:** cadastrar, listar, editar e excluir alunos
- **Categorias:** cadastrar, listar, editar e excluir categorias
- **Habilidades:** cadastrar, listar, editar e excluir habilidades

---

## 🔗 Rotas da Aplicação

### Públicas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Listagem de todas as receitas |
| GET | `/categorias/:id/receitas` | Receitas filtradas por categoria |
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

## 🔒 Segurança

- Senhas armazenadas com hash **bcrypt** (salt rounds: 10)
- Sessões com secret e expiração de 8 horas
- Middleware de autenticação protegendo todas as rotas privadas
- Validação de propriedade antes de editar/excluir receitas
- Foreign keys habilitadas no SQLite (`PRAGMA foreign_keys = ON`)

---

## 📦 Dados Iniciais (Seed)

Ao iniciar pela primeira vez, o sistema cria automaticamente:

**Categorias:** Sobremesas, Pratos Principais, Entradas, Bebidas, Lanches, Saladas

**Habilidades:** Confeitaria, Grelhados, Massas, Frutos do Mar, Vegetariano, Panificação

---

## 👨‍💻 Autor

Desenvolvido para a disciplina de **Programação Web Back-End** — UTFPR Campus Cornélio Procópio.
