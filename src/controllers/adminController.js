const Aluno = require('../models/Aluno');
const Categoria = require('../models/Categoria');
const Habilidade = require('../models/Habilidade');

const adminController = {
  dashboard(req, res) {
    const totalAlunos = Aluno.findAllAlunos().length;
    const totalCategorias = Categoria.findAll().length;
    const totalHabilidades = Habilidade.findAll().length;
    res.render('admin/dashboard', {
      title: 'Painel Administrativo',
      usuario: req.session.usuario,
      totalAlunos, totalCategorias, totalHabilidades,
      success: req.flash('success'),
      error: req.flash('error')
    });
  },

  // ── ALUNOS ──────────────────────────────────────────────
  listarAlunos(req, res) {
    const alunos = Aluno.findAllAlunos();
    res.render('admin/alunos/index', {
      title: 'Gerenciar Alunos',
      usuario: req.session.usuario,
      alunos,
      success: req.flash('success'),
      error: req.flash('error')
    });
  },

  novoAluno(req, res) {
    res.render('admin/alunos/create', {
      title: 'Novo Aluno',
      usuario: req.session.usuario,
      error: req.flash('error')
    });
  },

  criarAluno(req, res) {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      req.flash('error', 'Preencha todos os campos.');
      return res.redirect('/admin/alunos/novo');
    }
    try {
      Aluno.create({ nome, email, senha, tipo: 'aluno' });
      req.flash('success', 'Aluno cadastrado com sucesso!');
      res.redirect('/admin/alunos');
    } catch (e) {
      req.flash('error', 'E-mail já cadastrado.');
      res.redirect('/admin/alunos/novo');
    }
  },

  editarAluno(req, res) {
    const aluno = Aluno.findById(req.params.id);
    if (!aluno || aluno.tipo === 'admin') {
      req.flash('error', 'Aluno não encontrado.');
      return res.redirect('/admin/alunos');
    }
    res.render('admin/alunos/edit', {
      title: 'Editar Aluno',
      usuario: req.session.usuario,
      aluno,
      error: req.flash('error')
    });
  },

  atualizarAluno(req, res) {
    const { nome, email, senha } = req.body;
    const aluno = Aluno.findById(req.params.id);
    if (!aluno || aluno.tipo === 'admin') {
      req.flash('error', 'Aluno não encontrado.');
      return res.redirect('/admin/alunos');
    }
    if (!nome || !email) {
      req.flash('error', 'Nome e e-mail são obrigatórios.');
      return res.redirect(`/admin/alunos/${req.params.id}/editar`);
    }
    try {
      Aluno.update(req.params.id, { nome, email, senha });
      req.flash('success', 'Aluno atualizado com sucesso!');
      res.redirect('/admin/alunos');
    } catch (e) {
      req.flash('error', 'E-mail já cadastrado por outro aluno.');
      res.redirect(`/admin/alunos/${req.params.id}/editar`);
    }
  },

  excluirAluno(req, res) {
    const aluno = Aluno.findById(req.params.id);
    if (aluno && aluno.tipo !== 'admin') Aluno.delete(req.params.id);
    req.flash('success', 'Aluno excluído com sucesso!');
    res.redirect('/admin/alunos');
  },

  // ── CATEGORIAS ───────────────────────────────────────────
  listarCategorias(req, res) {
    const categorias = Categoria.findAll();
    res.render('admin/categorias/index', {
      title: 'Gerenciar Categorias',
      usuario: req.session.usuario,
      categorias,
      success: req.flash('success'),
      error: req.flash('error')
    });
  },

  novaCategoria(req, res) {
    res.render('admin/categorias/create', {
      title: 'Nova Categoria',
      usuario: req.session.usuario,
      error: req.flash('error')
    });
  },

  criarCategoria(req, res) {
    const { nome } = req.body;
    if (!nome) {
      req.flash('error', 'Nome é obrigatório.');
      return res.redirect('/admin/categorias/nova');
    }
    try {
      Categoria.create({ nome });
      req.flash('success', 'Categoria criada com sucesso!');
      res.redirect('/admin/categorias');
    } catch (e) {
      req.flash('error', 'Categoria já existe.');
      res.redirect('/admin/categorias/nova');
    }
  },

  editarCategoria(req, res) {
    const categoria = Categoria.findById(req.params.id);
    if (!categoria) {
      req.flash('error', 'Categoria não encontrada.');
      return res.redirect('/admin/categorias');
    }
    res.render('admin/categorias/edit', {
      title: 'Editar Categoria',
      usuario: req.session.usuario,
      categoria,
      error: req.flash('error')
    });
  },

  atualizarCategoria(req, res) {
    const { nome } = req.body;
    if (!nome) {
      req.flash('error', 'Nome é obrigatório.');
      return res.redirect(`/admin/categorias/${req.params.id}/editar`);
    }
    try {
      Categoria.update(req.params.id, { nome });
      req.flash('success', 'Categoria atualizada com sucesso!');
      res.redirect('/admin/categorias');
    } catch (e) {
      req.flash('error', 'Já existe uma categoria com esse nome.');
      res.redirect(`/admin/categorias/${req.params.id}/editar`);
    }
  },

  excluirCategoria(req, res) {
    Categoria.delete(req.params.id);
    req.flash('success', 'Categoria excluída com sucesso!');
    res.redirect('/admin/categorias');
  },

  // ── HABILIDADES ──────────────────────────────────────────
  listarHabilidades(req, res) {
    const habilidades = Habilidade.findAll();
    res.render('admin/habilidades/index', {
      title: 'Gerenciar Habilidades',
      usuario: req.session.usuario,
      habilidades,
      success: req.flash('success'),
      error: req.flash('error')
    });
  },

  novaHabilidade(req, res) {
    res.render('admin/habilidades/create', {
      title: 'Nova Habilidade',
      usuario: req.session.usuario,
      error: req.flash('error')
    });
  },

  criarHabilidade(req, res) {
    const { nome } = req.body;
    if (!nome) {
      req.flash('error', 'Nome é obrigatório.');
      return res.redirect('/admin/habilidades/nova');
    }
    try {
      Habilidade.create({ nome });
      req.flash('success', 'Habilidade criada com sucesso!');
      res.redirect('/admin/habilidades');
    } catch (e) {
      req.flash('error', 'Habilidade já existe.');
      res.redirect('/admin/habilidades/nova');
    }
  },

  editarHabilidade(req, res) {
    const habilidade = Habilidade.findById(req.params.id);
    if (!habilidade) {
      req.flash('error', 'Habilidade não encontrada.');
      return res.redirect('/admin/habilidades');
    }
    res.render('admin/habilidades/edit', {
      title: 'Editar Habilidade',
      usuario: req.session.usuario,
      habilidade,
      error: req.flash('error')
    });
  },

  atualizarHabilidade(req, res) {
    const { nome } = req.body;
    if (!nome) {
      req.flash('error', 'Nome é obrigatório.');
      return res.redirect(`/admin/habilidades/${req.params.id}/editar`);
    }
    try {
      Habilidade.update(req.params.id, { nome });
      req.flash('success', 'Habilidade atualizada com sucesso!');
      res.redirect('/admin/habilidades');
    } catch (e) {
      req.flash('error', 'Já existe uma habilidade com esse nome.');
      res.redirect(`/admin/habilidades/${req.params.id}/editar`);
    }
  },

  excluirHabilidade(req, res) {
    Habilidade.delete(req.params.id);
    req.flash('success', 'Habilidade excluída com sucesso!');
    res.redirect('/admin/habilidades');
  }
};

module.exports = adminController;
