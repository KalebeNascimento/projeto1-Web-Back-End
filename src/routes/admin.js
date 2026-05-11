const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

router.use(isAuthenticated, isAdmin);

router.get('/', adminController.dashboard);

// Alunos
router.get('/alunos', adminController.listarAlunos);
router.get('/alunos/novo', adminController.novoAluno);
router.post('/alunos', adminController.criarAluno);
router.get('/alunos/:id/editar', adminController.editarAluno);
router.put('/alunos/:id', adminController.atualizarAluno);
router.delete('/alunos/:id', adminController.excluirAluno);

// Categorias
router.get('/categorias', adminController.listarCategorias);
router.get('/categorias/nova', adminController.novaCategoria);
router.post('/categorias', adminController.criarCategoria);
router.get('/categorias/:id/editar', adminController.editarCategoria);
router.put('/categorias/:id', adminController.atualizarCategoria);
router.delete('/categorias/:id', adminController.excluirCategoria);

// Habilidades
router.get('/habilidades', adminController.listarHabilidades);
router.get('/habilidades/nova', adminController.novaHabilidade);
router.post('/habilidades', adminController.criarHabilidade);
router.get('/habilidades/:id/editar', adminController.editarHabilidade);
router.put('/habilidades/:id', adminController.atualizarHabilidade);
router.delete('/habilidades/:id', adminController.excluirHabilidade);

module.exports = router;
