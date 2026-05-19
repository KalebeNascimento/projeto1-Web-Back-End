const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const bcrypt = require('bcryptjs');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

const mongoose = require('mongoose');
const db_mongoose = require('./src/config/mongodb');
const { sequelize, AlunoModel, CategoriaModel, HabilidadeModel } = require('./src/models/index');

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
  cookie: { maxAge: 1000 * 60 * 60 * 8 },
}));

app.use(flash());

const authRoutes  = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const alunoRoutes = require('./src/routes/aluno');
const publicRoutes = require('./src/routes/public');
const apiRoutes   = require('./src/routes/api');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Portfólio Culinário – API Docs',
  swaggerOptions: { persistAuthorization: true },
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
    categoriaFiltro: null,
  });
});

async function seed() {
  const adminExiste = await AlunoModel.findOne({ where: { tipo: 'admin' } });
  if (!adminExiste) {
    const hash = await bcrypt.hash('admin123', 10);
    await AlunoModel.create({ nome: 'Administrador', email: 'admin@portfolio.com', senha: hash, tipo: 'admin' });
  }

  const categorias = ['Sobremesas', 'Pratos Principais', 'Entradas', 'Bebidas', 'Lanches', 'Saladas'];
  for (const nome of categorias) {
    await CategoriaModel.findOrCreate({ where: { nome } });
  }

  const habilidades = ['Confeitaria', 'Grelhados', 'Massas', 'Frutos do Mar', 'Vegetariano', 'Panificação'];
  for (const nome of habilidades) {
    await HabilidadeModel.findOrCreate({ where: { nome } });
  }
}

const PORT = process.env.PORT || 3000;

sequelize.sync().then(async () => {
  await seed();
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Admin padrão: admin@portfolio.com / admin123');
    console.log(`Swagger UI:   http://localhost:${PORT}/api-docs`);
  });
}).catch(err => {
  console.error('Erro ao inicializar banco de dados:', err);
  process.exit(1);
});

module.exports = app;
