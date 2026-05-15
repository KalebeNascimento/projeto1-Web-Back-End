const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

require('./src/config/database');

const mongoose = require('mongoose');
const db_mongoose = require('./src/config/mongodb');

mongoose.connect(db_mongoose.connection).then(() => {
  console.log('MongoDB conectado:', db_mongoose.connection);
}).catch((err) => {
  console.warn('MongoDB não disponível. Comentários estarão desativados.');
  console.error('Erro MongoDB:', err.message);
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(methodOverride('_method'));

app.use(session({
  secret: 'portfolio-culinario-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }
}));

app.use(flash());

const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const alunoRoutes = require('./src/routes/aluno');
const publicRoutes = require('./src/routes/public');
const apiRoutes = require('./src/routes/api');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Portfólio Culinário – API Docs',
  swaggerOptions: { persistAuthorization: true }
}));
app.use('/api/v1', apiRoutes);

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/aluno', alunoRoutes);
app.use('/', publicRoutes);

app.use((req, res) => {
  res.status(404).render('public/index', {
    title: 'Página não encontrada',
    usuario: req.session.usuario || null,
    receitas: [],
    categorias: [],
    categoriaFiltro: null
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Admin padrão: admin@portfolio.com / admin123');
  console.log(`Swagger UI:   http://localhost:${PORT}/api-docs`);
});

module.exports = app;
