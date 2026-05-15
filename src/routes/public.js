const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const comentarioController = require('../controllers/comentarioController');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

router.get('/', publicController.index);
router.get('/categorias/:id/receitas', publicController.receitasPorCategoria);
router.get('/relatorio', publicController.relatorio);

// Detalhe da receita com comentários
router.get('/receitas/:id', comentarioController.showReceita);
router.post('/receitas/:id/comentarios', comentarioController.criarComentario);

// Exclusão de comentário — apenas admin
router.post(
  '/receitas/:id/comentarios/:comentarioId/excluir',
  isAuthenticated,
  isAdmin,
  comentarioController.excluirComentario
);

module.exports = router;
