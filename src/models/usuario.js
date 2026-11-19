const crypto = require('crypto');
const db = require('./db');
const { ErroHttp, texto } = require('./erro');

function listar() {
  return db.carregar().usuarios;
}

function buscar(id) {
  return listar().find((u) => u.id === id);
}

function criar({ nome, turma }) {
  const dados = db.carregar();
  const usuario = {
    id: crypto.randomUUID(),
    nome: texto(nome, 'Nome', 60),
    turma: texto(turma, 'Turma', 20).toUpperCase(),
    criadoEm: new Date().toISOString(),
  };
  if (dados.usuarios.some((u) => u.nome.toLowerCase() === usuario.nome.toLowerCase() && u.turma === usuario.turma)) {
    throw new ErroHttp(409, 'Esse aluno já está cadastrado nessa turma');
  }
  dados.usuarios.push(usuario);
  db.salvar(dados);
  return usuario;
}

module.exports = { listar, buscar, criar };
