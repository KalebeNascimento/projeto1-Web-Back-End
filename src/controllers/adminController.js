const Aluno = require('../models/Aluno');
const Categoria = require('../models/Categoria');
const Habilidade = require('../models/Habilidade');

const adminController = {
  async dashboard(req, res) {
    const [alunos, categorias, habilidades] = await Promise.all([
      Aluno.findAllAlunos(),
      Categoria.findAll(),
      Habilidade.findAll(),
    ]);
    res.render('admin/dashboard', {
      title: 'Painel Administrativo',
      usuario: req.session.usuario,
      totalAlunos: alunos.length,
      totalCategorias: categorias.length,
      totalHabilidades: habilidades.length,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  },

  // ── ALUNOS ──────────────────────────────────────────────
  async listarAlunos(req, res) {
    const alunos = await Aluno.findAllAlunos();
    res.render('admin/alunos/index', {
      title: 'Gerenciar Alunos',
      usuario: req.session.usuario,
      alunos,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  },

  novoAluno(req, res) {
    res.render('admin/alunos/create', {
      title: 'Novo Aluno',
      usuario: req.session.usuario,
      error: req.flash('error'),
    });
  },

  async criarAluno(req, res) {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      req.flash('error', 'Preencha todos os campos.');
      return res.redirect('/admin/alunos/novo');
    }
    try {
      await Aluno.create({ nome, email, senha, tipo: 'aluno' });
      req.flash('success', 'Aluno cadastrado com sucesso!');
      res.redirect('/admin/alunos');
    } catch {
      req.flash('error', 'E-mail já cadastrado.');
      res.redirect('/admin/alunos/novo');
    }
  },

  async editarAluno(req, res) {
    const aluno = await Aluno.findById(req.params.id);
    if (!aluno || aluno.tipo === 'admin') {
      req.flash('error', 'Aluno não encontrado.');
      return res.redirect('/admin/alunos');
    }
    res.render('admin/alunos/edit', {
      title: 'Editar Aluno',
      usuario: req.session.usuario,
      aluno,
      error: req.flash('error'),
    });
  },

  async atualizarAluno(req, res) {
    const { nome, email, senha } = req.body;
    const aluno = await Aluno.findById(req.params.id);
    if (!aluno || aluno.tipo === 'admin') {
      req.flash('error', 'Aluno não encontrado.');
      return res.redirect('/admin/alunos');
    }
    if (!nome || !email) {
      req.flash('error', 'Nome e e-mail são obrigatórios.');
      return res.redirect(`/admin/alunos/${req.params.id}/editar`);
    }
    try {
      await Aluno.update(req.params.id, { nome, email, senha });
      req.flash('success', 'Aluno atualizado com sucesso!');
      res.redirect('/admin/alunos');
    } catch {
      req.flash('error', 'E-mail já cadastrado por outro aluno.');
      res.redirect(`/admin/alunos/${req.params.id}/editar`);
    }
  },

  async excluirAluno(req, res) {
    const aluno = await Aluno.findById(req.params.id);
    if (aluno && aluno.tipo !== 'admin') await Aluno.delete(req.params.id);
    req.flash('success', 'Aluno excluído com sucesso!');
    res.redirect('/admin/alunos');
  },

  // ── CATEGORIAS ───────────────────────────────────────────
  async listarCategorias(req, res) {
    const categorias = await Categoria.findAll();
    res.render('admin/categorias/index', {
      title: 'Gerenciar Categorias',
      usuario: req.session.usuario,
      categorias,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  },

  novaCategoria(req, res) {
    res.render('admin/categorias/create', {
      title: 'Nova Categoria',
      usuario: req.session.usuario,
      error: req.flash('error'),
    });
  },

  async criarCategoria(req, res) {
    const { nome } = req.body;
    if (!nome) {
      req.flash('error', 'Nome é obrigatório.');
      return res.redirect('/admin/categorias/nova');
    }
    try {
      await Categoria.create({ nome });
      req.flash('success', 'Categoria criada com sucesso!');
      res.redirect('/admin/categorias');
    } catch {
      req.flash('error', 'Categoria já existe.');
      res.redirect('/admin/categorias/nova');
    }
  },

  async editarCategoria(req, res) {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      req.flash('error', 'Categoria não encontrada.');
      return res.redirect('/admin/categorias');
    }
    res.render('admin/categorias/edit', {
      title: 'Editar Categoria',
      usuario: req.session.usuario,
      categoria,
      error: req.flash('error'),
    });
  },

  async atualizarCategoria(req, res) {
    const { nome } = req.body;
    if (!nome) {
      req.flash('error', 'Nome é obrigatório.');
      return res.redirect(`/admin/categorias/${req.params.id}/editar`);
    }
    try {
      await Categoria.update(req.params.id, { nome });
      req.flash('success', 'Categoria atualizada com sucesso!');
      res.redirect('/admin/categorias');
    } catch {
      req.flash('error', 'Já existe uma categoria com esse nome.');
      res.redirect(`/admin/categorias/${req.params.id}/editar`);
    }
  },

  async excluirCategoria(req, res) {
    await Categoria.delete(req.params.id);
    req.flash('success', 'Categoria excluída com sucesso!');
    res.redirect('/admin/categorias');
  },

  // ── HABILIDADES ──────────────────────────────────────────
  async listarHabilidades(req, res) {
    const habilidades = await Habilidade.findAll();
    res.render('admin/habilidades/index', {
      title: 'Gerenciar Habilidades',
      usuario: req.session.usuario,
      habilidades,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  },

  novaHabilidade(req, res) {
    res.render('admin/habilidades/create', {
      title: 'Nova Habilidade',
      usuario: req.session.usuario,
      error: req.flash('error'),
    });
  },

  async criarHabilidade(req, res) {
    const { nome } = req.body;
    if (!nome) {
      req.flash('error', 'Nome é obrigatório.');
      return res.redirect('/admin/habilidades/nova');
    }
    try {
      await Habilidade.create({ nome });
      req.flash('success', 'Habilidade criada com sucesso!');
      res.redirect('/admin/habilidades');
    } catch {
      req.flash('error', 'Habilidade já existe.');
      res.redirect('/admin/habilidades/nova');
    }
  },

  async editarHabilidade(req, res) {
    const habilidade = await Habilidade.findById(req.params.id);
    if (!habilidade) {
      req.flash('error', 'Habilidade não encontrada.');
      return res.redirect('/admin/habilidades');
    }
    res.render('admin/habilidades/edit', {
      title: 'Editar Habilidade',
      usuario: req.session.usuario,
      habilidade,
      error: req.flash('error'),
    });
  },

  async atualizarHabilidade(req, res) {
    const { nome } = req.body;
    if (!nome) {
      req.flash('error', 'Nome é obrigatório.');
      return res.redirect(`/admin/habilidades/${req.params.id}/editar`);
    }
    try {
      await Habilidade.update(req.params.id, { nome });
      req.flash('success', 'Habilidade atualizada com sucesso!');
      res.redirect('/admin/habilidades');
    } catch {
      req.flash('error', 'Já existe uma habilidade com esse nome.');
      res.redirect(`/admin/habilidades/${req.params.id}/editar`);
    }
  },

  async excluirHabilidade(req, res) {
    await Habilidade.delete(req.params.id);
    req.flash('success', 'Habilidade excluída com sucesso!');
    res.redirect('/admin/habilidades');
  },
};

module.exports = adminController;
