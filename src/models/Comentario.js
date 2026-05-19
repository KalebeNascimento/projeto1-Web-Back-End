const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema({
  receita_id: {
    type: Number,
    required: true,
    index: true
  },
  autor_nome: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  conteudo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Comentario', comentarioSchema);
