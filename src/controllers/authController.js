const Aluno = require('../models/Aluno');

const authController = {
  showLogin(req, res) {
    if (req.session.usuario) return res.redirect('/');
    res.render('auth/login', { title: 'Login', error: req.flash('error') });
  },

  login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      req.flash('error', 'Preencha todos os campos.');
      return res.redirect('/login');
    }

    const aluno = Aluno.findByEmail(email);
    if (!aluno || !Aluno.validatePassword(senha, aluno.senha)) {
      req.flash('error', 'E-mail ou senha inválidos.');
      return res.redirect('/login');
    }

    req.session.usuario = { id: aluno.id, nome: aluno.nome, email: aluno.email, tipo: aluno.tipo };

    if (aluno.tipo === 'admin') return res.redirect('/admin');
    return res.redirect('/aluno');
  },

  logout(req, res) {
    req.session.destroy(() => res.redirect('/login'));
  }
};

module.exports = authController;
