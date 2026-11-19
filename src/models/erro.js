class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

function texto(valor, campo, max) {
  const t = typeof valor === 'string' ? valor.trim() : '';
  if (!t) throw new ErroHttp(400, `${campo} é obrigatório`);
  if (t.length > max) throw new ErroHttp(400, `${campo} deve ter até ${max} caracteres`);
  return t;
}

module.exports = { ErroHttp, texto };
