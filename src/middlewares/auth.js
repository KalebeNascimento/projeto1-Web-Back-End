function isAuthenticated(req, res, next) {
  if (req.session && req.session.usuario) return next();
  req.flash('error', 'Faça login para acessar esta página.');
  res.redirect('/login');
}

function isAdmin(req, res, next) {
  if (req.session && req.session.usuario && req.session.usuario.tipo === 'admin') return next();
  res.status(403).redirect('/');
}

function isAluno(req, res, next) {
  if (req.session && req.session.usuario && req.session.usuario.tipo === 'aluno') return next();
  res.status(403).redirect('/');
}

module.exports = { isAuthenticated, isAdmin, isAluno };
