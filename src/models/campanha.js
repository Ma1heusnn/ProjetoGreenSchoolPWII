const crypto = require('crypto');
const db = require('./db');
const { ErroHttp, texto } = require('./erro');

function buscar(id) {
  return db.carregar().campanhas.find((c) => c.id === id);
}

// Lista campanhas com o progresso (soma de pontos das ações vinculadas).
function listar() {
  const { campanhas, acoes } = db.carregar();
  return campanhas.map((c) => {
    const feitas = acoes.filter((a) => a.campanhaId === c.id);
    return {
      ...c,
      pontos: feitas.reduce((s, a) => s + a.pontos, 0),
      participantes: new Set(feitas.map((a) => a.usuarioId)).size,
    };
  });
}

function criar({ nome, descricao, meta }) {
  const m = Number(meta);
  if (!Number.isInteger(m) || m < 10 || m > 100000) throw new ErroHttp(400, 'Meta deve ser de 10 a 100000 pontos');
  const dados = db.carregar();
  const campanha = {
    id: crypto.randomUUID(),
    nome: texto(nome, 'Nome', 60),
    descricao: texto(descricao, 'Descrição', 140),
    meta: m,
  };
  dados.campanhas.push(campanha);
  db.salvar(dados);
  return campanha;
}

module.exports = { buscar, listar, criar };
