const express = require('express');
const router = express.Router();
const Aluno = require('../models/Aluno');
const Receita = require('../models/Receita');
const Categoria = require('../models/Categoria');
const Habilidade = require('../models/Habilidade');

// ── Middlewares locais ───────────────────────────────────
function apiAuth(req, res, next) {
  if (req.session && req.session.usuario) return next();
  res.status(401).json({ erro: 'Não autenticado. Faça login em POST /api/v1/auth/login' });
}

function apiAdmin(req, res, next) {
  if (req.session?.usuario?.tipo === 'admin') return next();
  res.status(403).json({ erro: 'Acesso restrito ao administrador.' });
}

function apiAluno(req, res, next) {
  if (req.session?.usuario?.tipo === 'aluno') return next();
  res.status(403).json({ erro: 'Acesso restrito a alunos.' });
}

// ════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Realizar login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@portfolio.com
 *               senha:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem: { type: string }
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     nome: { type: string }
 *                     email: { type: string }
 *                     tipo: { type: string }
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });

  const aluno = await Aluno.findByEmail(email);
  if (!aluno || !(await Aluno.validatePassword(senha, aluno.senha)))
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });

  req.session.usuario = { id: aluno.id, nome: aluno.nome, email: aluno.email, tipo: aluno.tipo };
  res.json({ mensagem: 'Login realizado com sucesso.', usuario: req.session.usuario });
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Encerrar sessão
 *     responses:
 *       200:
 *         description: Logout realizado
 */
router.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ mensagem: 'Logout realizado com sucesso.' }));
});

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Retorna o usuário autenticado
 *     security: [{}]
 *     responses:
 *       200:
 *         description: Dados do usuário logado
 *       401:
 *         description: Não autenticado
 */
router.get('/auth/me', apiAuth, (req, res) => {
  res.json({ usuario: req.session.usuario });
});

// ════════════════════════════════════════════════════════
// PÚBLICO
// ════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/receitas:
 *   get:
 *     tags: [Público]
 *     summary: Listar todas as receitas
 *     parameters:
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: integer
 *         description: Filtrar por categoria
 *     responses:
 *       200:
 *         description: Lista de receitas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Receita'
 */
router.get('/receitas', async (req, res) => {
  const { categoria_id } = req.query;
  const receitas = categoria_id
    ? await Receita.findByCategoria(categoria_id)
    : await Receita.findAll();
  res.json(receitas);
});

/**
 * @swagger
 * /api/v1/receitas/{id}:
 *   get:
 *     tags: [Público]
 *     summary: Buscar receita por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados da receita com categorias e alunos responsáveis
 *       404:
 *         description: Receita não encontrada
 */
router.get('/receitas/:id', async (req, res) => {
  const receita = await Receita.findById(req.params.id);
  if (!receita) return res.status(404).json({ erro: 'Receita não encontrada.' });
  const [categorias, alunos_responsaveis] = await Promise.all([
    Receita.getCategorias(req.params.id),
    Receita.getAlunos(req.params.id),
  ]);
  receita.categorias = categorias;
  receita.alunos_responsaveis = alunos_responsaveis;
  res.json(receita);
});

/**
 * @swagger
 * /api/v1/categorias:
 *   get:
 *     tags: [Público]
 *     summary: Listar todas as categorias
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 */
router.get('/categorias', async (req, res) => res.json(await Categoria.findAll()));

/**
 * @swagger
 * /api/v1/habilidades:
 *   get:
 *     tags: [Público]
 *     summary: Listar todas as habilidades
 *     responses:
 *       200:
 *         description: Lista de habilidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Habilidade'
 */
router.get('/habilidades', async (req, res) => res.json(await Habilidade.findAll()));

/**
 * @swagger
 * /api/v1/relatorio/habilidades:
 *   get:
 *     tags: [Público]
 *     summary: Relatório de proporção de alunos por habilidade
 *     responses:
 *       200:
 *         description: Relatório de habilidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RelatorioHabilidade'
 */
router.get('/relatorio/habilidades', async (req, res) => {
  res.json(await Habilidade.getRelatorioHabilidades());
});

// ════════════════════════════════════════════════════════
// ALUNO – RECEITAS
// ════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/aluno/receitas:
 *   get:
 *     tags: [Receitas]
 *     summary: Listar receitas do aluno logado
 *     security: [{}]
 *     responses:
 *       200:
 *         description: Receitas do aluno
 *       401:
 *         description: Não autenticado
 */
router.get('/aluno/receitas', apiAuth, apiAluno, async (req, res) => {
  res.json(await Receita.findByAluno(req.session.usuario.id));
});

/**
 * @swagger
 * /api/v1/aluno/receitas:
 *   post:
 *     tags: [Receitas]
 *     summary: Criar nova receita
 *     security: [{}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Bolo de Cenoura
 *               descricao:
 *                 type: string
 *                 example: Receita clássica de bolo de cenoura
 *               link_externo:
 *                 type: string
 *                 example: https://exemplo.com/bolo
 *               categorias:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *               coautores:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [3]
 *     responses:
 *       201:
 *         description: Receita criada
 *       400:
 *         description: Nome é obrigatório
 *       401:
 *         description: Não autenticado
 */
router.post('/aluno/receitas', apiAuth, apiAluno, async (req, res) => {
  const { nome, descricao, link_externo, categorias = [], coautores = [] } = req.body;
  if (!nome) return res.status(400).json({ erro: 'O nome da receita é obrigatório.' });

  const id = await Receita.create({ nome, descricao, link_externo, criado_por: req.session.usuario.id });
  const alunosIds = [...new Set([req.session.usuario.id, ...coautores.map(Number)])];
  await Receita.setAlunos(id, alunosIds);
  await Receita.setCategorias(id, categorias.map(Number).filter(Boolean));

  const receita = await Receita.findById(id);
  const [cats, alunos] = await Promise.all([Receita.getCategorias(id), Receita.getAlunos(id)]);
  receita.categorias = cats;
  receita.alunos_responsaveis = alunos;
  res.status(201).json(receita);
});

/**
 * @swagger
 * /api/v1/aluno/receitas/{id}:
 *   put:
 *     tags: [Receitas]
 *     summary: Atualizar receita
 *     security: [{}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome: { type: string }
 *               descricao: { type: string }
 *               link_externo: { type: string }
 *               categorias:
 *                 type: array
 *                 items: { type: integer }
 *               coautores:
 *                 type: array
 *                 items: { type: integer }
 *     responses:
 *       200:
 *         description: Receita atualizada
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Receita não encontrada
 */
router.put('/aluno/receitas/:id', apiAuth, apiAluno, async (req, res) => {
  const [receita, responsavel] = await Promise.all([
    Receita.findById(req.params.id),
    Receita.isResponsavel(req.params.id, req.session.usuario.id),
  ]);
  if (!receita) return res.status(404).json({ erro: 'Receita não encontrada.' });
  if (!responsavel) return res.status(403).json({ erro: 'Sem permissão para editar esta receita.' });

  const { nome, descricao, link_externo, categorias = [], coautores = [] } = req.body;
  if (!nome) return res.status(400).json({ erro: 'O nome da receita é obrigatório.' });

  await Receita.update(req.params.id, { nome, descricao, link_externo });
  const alunosIds = [...new Set([req.session.usuario.id, ...coautores.map(Number)])];
  await Receita.setAlunos(req.params.id, alunosIds);
  await Receita.setCategorias(req.params.id, categorias.map(Number).filter(Boolean));

  const atualizada = await Receita.findById(req.params.id);
  const [cats, alunos] = await Promise.all([
    Receita.getCategorias(req.params.id),
    Receita.getAlunos(req.params.id),
  ]);
  atualizada.categorias = cats;
  atualizada.alunos_responsaveis = alunos;
  res.json(atualizada);
});

/**
 * @swagger
 * /api/v1/aluno/receitas/{id}:
 *   delete:
 *     tags: [Receitas]
 *     summary: Excluir receita
 *     security: [{}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Receita excluída
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Receita não encontrada
 */
router.delete('/aluno/receitas/:id', apiAuth, apiAluno, async (req, res) => {
  const [receita, responsavel] = await Promise.all([
    Receita.findById(req.params.id),
    Receita.isResponsavel(req.params.id, req.session.usuario.id),
  ]);
  if (!receita) return res.status(404).json({ erro: 'Receita não encontrada.' });
  if (!responsavel) return res.status(403).json({ erro: 'Sem permissão para excluir esta receita.' });

  await Receita.delete(req.params.id);
  res.json({ mensagem: 'Receita excluída com sucesso.' });
});

// ════════════════════════════════════════════════════════
// ALUNO – HABILIDADES
// ════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/aluno/habilidades:
 *   get:
 *     tags: [Habilidades do Aluno]
 *     summary: Listar habilidades do aluno logado
 *     security: [{}]
 *     responses:
 *       200:
 *         description: Habilidades do aluno com nível
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HabilidadeAluno'
 */
router.get('/aluno/habilidades', apiAuth, apiAluno, async (req, res) => {
  res.json(await Aluno.getHabilidades(req.session.usuario.id));
});

/**
 * @swagger
 * /api/v1/aluno/habilidades:
 *   post:
 *     tags: [Habilidades do Aluno]
 *     summary: Adicionar habilidade ao aluno
 *     security: [{}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [habilidade_id, nivel]
 *             properties:
 *               habilidade_id:
 *                 type: integer
 *                 example: 1
 *               nivel:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *                 example: 7
 *     responses:
 *       201:
 *         description: Habilidade adicionada
 *       400:
 *         description: Dados inválidos ou habilidade já cadastrada
 */
router.post('/aluno/habilidades', apiAuth, apiAluno, async (req, res) => {
  const { habilidade_id, nivel } = req.body;
  const nivelNum = parseInt(nivel);
  if (!habilidade_id || isNaN(nivelNum) || nivelNum < 0 || nivelNum > 10)
    return res.status(400).json({ erro: 'habilidade_id e nivel (0-10) são obrigatórios.' });
  if (await Aluno.hasHabilidade(req.session.usuario.id, habilidade_id))
    return res.status(400).json({ erro: 'Habilidade já cadastrada.' });

  await Aluno.addHabilidade(req.session.usuario.id, habilidade_id, nivelNum);
  res.status(201).json({ mensagem: 'Habilidade adicionada.', habilidade_id, nivel: nivelNum });
});

/**
 * @swagger
 * /api/v1/aluno/habilidades/{habilidadeId}:
 *   put:
 *     tags: [Habilidades do Aluno]
 *     summary: Atualizar nível de uma habilidade
 *     security: [{}]
 *     parameters:
 *       - in: path
 *         name: habilidadeId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nivel]
 *             properties:
 *               nivel:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *                 example: 9
 *     responses:
 *       200:
 *         description: Nível atualizado
 *       400:
 *         description: Nível inválido
 */
router.put('/aluno/habilidades/:habilidadeId', apiAuth, apiAluno, async (req, res) => {
  const nivelNum = parseInt(req.body.nivel);
  if (isNaN(nivelNum) || nivelNum < 0 || nivelNum > 10)
    return res.status(400).json({ erro: 'Nível deve ser entre 0 e 10.' });

  await Aluno.updateHabilidade(req.session.usuario.id, req.params.habilidadeId, nivelNum);
  res.json({ mensagem: 'Nível atualizado.', nivel: nivelNum });
});

/**
 * @swagger
 * /api/v1/aluno/habilidades/{habilidadeId}:
 *   delete:
 *     tags: [Habilidades do Aluno]
 *     summary: Remover habilidade do aluno
 *     security: [{}]
 *     parameters:
 *       - in: path
 *         name: habilidadeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Habilidade removida
 */
router.delete('/aluno/habilidades/:habilidadeId', apiAuth, apiAluno, async (req, res) => {
  await Aluno.removeHabilidade(req.session.usuario.id, req.params.habilidadeId);
  res.json({ mensagem: 'Habilidade removida com sucesso.' });
});

// ════════════════════════════════════════════════════════
// ADMIN – ALUNOS
// ════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/admin/alunos:
 *   get:
 *     tags: [Admin – Alunos]
 *     summary: Listar todos os alunos
 *     security: [{}]
 *     responses:
 *       200:
 *         description: Lista de alunos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Aluno'
 *       403:
 *         description: Acesso restrito ao administrador
 */
router.get('/admin/alunos', apiAuth, apiAdmin, async (req, res) => {
  res.json(await Aluno.findAllAlunos());
});

/**
 * @swagger
 * /api/v1/admin/alunos:
 *   post:
 *     tags: [Admin – Alunos]
 *     summary: Cadastrar novo aluno
 *     security: [{}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome: { type: string, example: Maria Oliveira }
 *               email: { type: string, example: maria@email.com }
 *               senha: { type: string, example: senha123 }
 *     responses:
 *       201:
 *         description: Aluno criado
 *       400:
 *         description: Campos obrigatórios ausentes ou e-mail já cadastrado
 */
router.post('/admin/alunos', apiAuth, apiAdmin, async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  try {
    const id = await Aluno.create({ nome, email, senha, tipo: 'aluno' });
    res.status(201).json(await Aluno.findById(id));
  } catch {
    res.status(400).json({ erro: 'E-mail já cadastrado.' });
  }
});

/**
 * @swagger
 * /api/v1/admin/alunos/{id}:
 *   put:
 *     tags: [Admin – Alunos]
 *     summary: Atualizar aluno
 *     security: [{}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email]
 *             properties:
 *               nome: { type: string }
 *               email: { type: string }
 *               senha: { type: string, description: 'Deixe vazio para manter a senha atual' }
 *     responses:
 *       200:
 *         description: Aluno atualizado
 *       404:
 *         description: Aluno não encontrado
 */
router.put('/admin/alunos/:id', apiAuth, apiAdmin, async (req, res) => {
  const aluno = await Aluno.findById(req.params.id);
  if (!aluno || aluno.tipo === 'admin')
    return res.status(404).json({ erro: 'Aluno não encontrado.' });
  const { nome, email, senha } = req.body;
  if (!nome || !email)
    return res.status(400).json({ erro: 'Nome e e-mail são obrigatórios.' });
  try {
    await Aluno.update(req.params.id, { nome, email, senha });
    res.json(await Aluno.findById(req.params.id));
  } catch {
    res.status(400).json({ erro: 'E-mail já cadastrado por outro aluno.' });
  }
});

/**
 * @swagger
 * /api/v1/admin/alunos/{id}:
 *   delete:
 *     tags: [Admin – Alunos]
 *     summary: Excluir aluno
 *     security: [{}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Aluno excluído
 *       404:
 *         description: Aluno não encontrado
 */
router.delete('/admin/alunos/:id', apiAuth, apiAdmin, async (req, res) => {
  const aluno = await Aluno.findById(req.params.id);
  if (!aluno || aluno.tipo === 'admin')
    return res.status(404).json({ erro: 'Aluno não encontrado.' });
  await Aluno.delete(req.params.id);
  res.json({ mensagem: 'Aluno excluído com sucesso.' });
});

// ════════════════════════════════════════════════════════
// ADMIN – CATEGORIAS
// ════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/admin/categorias:
 *   get:
 *     tags: [Admin – Categorias]
 *     summary: Listar categorias
 *     security: [{}]
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/admin/categorias', apiAuth, apiAdmin, async (req, res) => res.json(await Categoria.findAll()));

/**
 * @swagger
 * /api/v1/admin/categorias:
 *   post:
 *     tags: [Admin – Categorias]
 *     summary: Criar categoria
 *     security: [{}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string, example: Vegano }
 *     responses:
 *       201:
 *         description: Categoria criada
 *       400:
 *         description: Nome obrigatório ou já existe
 */
router.post('/admin/categorias', apiAuth, apiAdmin, async (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' });
  try {
    const id = await Categoria.create({ nome });
    res.status(201).json(await Categoria.findById(id));
  } catch {
    res.status(400).json({ erro: 'Categoria já existe.' });
  }
});

/**
 * @swagger
 * /api/v1/admin/categorias/{id}:
 *   put:
 *     tags: [Admin – Categorias]
 *     summary: Atualizar categoria
 *     security: [{}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string }
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *       404:
 *         description: Não encontrada
 */
router.put('/admin/categorias/:id', apiAuth, apiAdmin, async (req, res) => {
  const categoria = await Categoria.findById(req.params.id);
  if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada.' });
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' });
  try {
    await Categoria.update(req.params.id, { nome });
    res.json(await Categoria.findById(req.params.id));
  } catch {
    res.status(400).json({ erro: 'Já existe uma categoria com esse nome.' });
  }
});

/**
 * @swagger
 * /api/v1/admin/categorias/{id}:
 *   delete:
 *     tags: [Admin – Categorias]
 *     summary: Excluir categoria
 *     security: [{}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoria excluída
 *       404:
 *         description: Não encontrada
 */
router.delete('/admin/categorias/:id', apiAuth, apiAdmin, async (req, res) => {
  if (!(await Categoria.findById(req.params.id)))
    return res.status(404).json({ erro: 'Categoria não encontrada.' });
  await Categoria.delete(req.params.id);
  res.json({ mensagem: 'Categoria excluída com sucesso.' });
});

// ════════════════════════════════════════════════════════
// ADMIN – HABILIDADES
// ════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/admin/habilidades:
 *   get:
 *     tags: [Admin – Habilidades]
 *     summary: Listar habilidades
 *     security: [{}]
 *     responses:
 *       200:
 *         description: Lista de habilidades
 */
router.get('/admin/habilidades', apiAuth, apiAdmin, async (req, res) => res.json(await Habilidade.findAll()));

/**
 * @swagger
 * /api/v1/admin/habilidades:
 *   post:
 *     tags: [Admin – Habilidades]
 *     summary: Criar habilidade
 *     security: [{}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string, example: Defumação }
 *     responses:
 *       201:
 *         description: Habilidade criada
 *       400:
 *         description: Nome obrigatório ou já existe
 */
router.post('/admin/habilidades', apiAuth, apiAdmin, async (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' });
  try {
    const id = await Habilidade.create({ nome });
    res.status(201).json(await Habilidade.findById(id));
  } catch {
    res.status(400).json({ erro: 'Habilidade já existe.' });
  }
});

/**
 * @swagger
 * /api/v1/admin/habilidades/{id}:
 *   put:
 *     tags: [Admin – Habilidades]
 *     summary: Atualizar habilidade
 *     security: [{}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string }
 *     responses:
 *       200:
 *         description: Habilidade atualizada
 *       404:
 *         description: Não encontrada
 */
router.put('/admin/habilidades/:id', apiAuth, apiAdmin, async (req, res) => {
  const habilidade = await Habilidade.findById(req.params.id);
  if (!habilidade) return res.status(404).json({ erro: 'Habilidade não encontrada.' });
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' });
  try {
    await Habilidade.update(req.params.id, { nome });
    res.json(await Habilidade.findById(req.params.id));
  } catch {
    res.status(400).json({ erro: 'Já existe uma habilidade com esse nome.' });
  }
});

/**
 * @swagger
 * /api/v1/admin/habilidades/{id}:
 *   delete:
 *     tags: [Admin – Habilidades]
 *     summary: Excluir habilidade
 *     security: [{}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Habilidade excluída
 *       404:
 *         description: Não encontrada
 */
router.delete('/admin/habilidades/:id', apiAuth, apiAdmin, async (req, res) => {
  if (!(await Habilidade.findById(req.params.id)))
    return res.status(404).json({ erro: 'Habilidade não encontrada.' });
  await Habilidade.delete(req.params.id);
  res.json({ mensagem: 'Habilidade excluída com sucesso.' });
});

module.exports = router;
