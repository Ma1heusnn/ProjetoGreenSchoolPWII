const fs = require('fs');
const path = require('path');

const ARQUIVO = path.join(__dirname, '..', '..', 'data', 'db.json');

const inicial = {
  usuarios: [],
  acoes: [],
  campanhas: [
    { id: 'c1', nome: 'Desafio da Reciclagem', descricao: 'Separar e descartar corretamente o lixo da escola.', meta: 300 },
    { id: 'c2', nome: 'Mês da Água', descricao: 'Reduzir o desperdício de água em casa e na escola.', meta: 200 },
    { id: 'c3', nome: 'Horta Escolar', descricao: 'Plantar e cuidar da horta do pátio.', meta: 150 },
  ],
};

function carregar() {
  try {
    return JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));
  } catch {
    salvar(inicial);
    return structuredClone(inicial);
  }
}

function salvar(dados) {
  fs.mkdirSync(path.dirname(ARQUIVO), { recursive: true });
  fs.writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2));
}

module.exports = { carregar, salvar };
