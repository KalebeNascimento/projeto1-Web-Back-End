const StringCon = {
  connection: process.env.MONGO_URI || 'mongodb://localhost/portfolio_culinario'
};

module.exports = StringCon;
