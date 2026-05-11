const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');
const { isAuthenticated, isAluno } = require('../middlewares/auth');

router.use(isAuthenticated, isAluno);

router.get('/', alunoController.dashboard);

// Receitas
router.get('/receitas', alunoController.listarReceitas);
router.get('/receitas/nova', alunoController.novaReceita);
router.post('/receitas', alunoController.criarReceita);
router.get('/receitas/:id/editar', alunoController.editarReceita);
router.put('/receitas/:id', alunoController.atualizarReceita);
router.delete('/receitas/:id', alunoController.excluirReceita);

// Habilidades
router.get('/habilidades', alunoController.listarHabilidades);
router.post('/habilidades', alunoController.adicionarHabilidade);
router.post('/habilidades/:habilidadeId/editar', alunoController.editarHabilidade);
router.delete('/habilidades/:habilidadeId', alunoController.removerHabilidade);

module.exports = router;
