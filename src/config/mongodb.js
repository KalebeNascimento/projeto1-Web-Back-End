const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio_culinario';

async function connectMongoDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB conectado:', MONGO_URI);
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    console.warn('Comentários não estarão disponíveis sem o MongoDB.');
  }
}

module.exports = connectMongoDB;
