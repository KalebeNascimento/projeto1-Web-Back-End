const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.index);
router.get('/categorias/:id/receitas', publicController.receitasPorCategoria);
router.get('/relatorio', publicController.relatorio);

module.exports = router;
