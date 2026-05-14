const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfólio de Receitas Culinárias – API',
      version: '1.0.0',
      description: `
API REST do sistema de portfólio de receitas culinárias – UTFPR.

## Autenticação
Faça **POST /api/v1/auth/login** para obter uma sessão. A sessão é mantida via cookie \`connect.sid\`.
Clique em **Authorize** e informe o e-mail e senha para usar os endpoints protegidos.

**Credenciais padrão:**
- Admin: \`admin@portfolio.com\` / \`admin123\`
      `,
      contact: { name: 'UTFPR – Programação Web Back-End' }
    },
    servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
    tags: [
      { name: 'Auth', description: 'Login e logout' },
      { name: 'Receitas', description: 'CRUD de receitas (aluno)' },
      { name: 'Habilidades do Aluno', description: 'Habilidades do aluno logado' },
      { name: 'Admin – Alunos', description: 'Gestão de alunos (admin)' },
      { name: 'Admin – Categorias', description: 'Gestão de categorias (admin)' },
      { name: 'Admin – Habilidades', description: 'Gestão de habilidades (admin)' },
      { name: 'Público', description: 'Endpoints públicos sem autenticação' }
    ],
    components: {
      schemas: {
        Aluno: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao@email.com' },
            tipo: { type: 'string', enum: ['aluno', 'admin'], example: 'aluno' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Receita: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'Bolo de Chocolate' },
            descricao: { type: 'string', example: 'Um bolo fofinho e saboroso' },
            link_externo: { type: 'string', example: 'https://exemplo.com/receita' },
            criado_por: { type: 'integer', example: 2 },
            criador_nome: { type: 'string', example: 'João Silva' },
            categorias_nomes: { type: 'string', example: 'Sobremesas,Lanches' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Categoria: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'Sobremesas' }
          }
        },
        Habilidade: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'Confeitaria' }
          }
        },
        HabilidadeAluno: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'Confeitaria' },
            nivel: { type: 'integer', minimum: 0, maximum: 10, example: 8 }
          }
        },
        RelatorioHabilidade: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string', example: 'Confeitaria' },
            total_alunos: { type: 'integer', example: 3 },
            media_nivel: { type: 'number', example: 7.5 },
            proporcao: { type: 'integer', example: 60, description: '% de alunos que possuem esta habilidade' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            erro: { type: 'string', example: 'Mensagem de erro' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/api.js']
};

module.exports = swaggerJsdoc(options);
