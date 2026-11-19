const usuarios = require('./controllers/usuarioController');
const acoes = require('./controllers/acaoController');
const campanhas = require('./controllers/campanhaController');
const ranking = require('./controllers/rankingController');

module.exports = [
  ['GET', '/api/usuarios', usuarios.listar],
  ['POST', '/api/usuarios', usuarios.criar],
  ['GET', '/api/tipos', acoes.tipos],
  ['GET', '/api/acoes', acoes.listar],
  ['POST', '/api/acoes', acoes.criar],
  ['GET', '/api/campanhas', campanhas.listar],
  ['POST', '/api/campanhas', campanhas.criar],
  ['GET', '/api/ranking', ranking.ranking],
];
