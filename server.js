const http = require('http');
const fs = require('fs');
const path = require('path');
const routes = require('./src/routes');
const { ErroHttp } = require('./src/models/erro');

const PUBLIC = path.join(__dirname, 'public');
const PORTA = process.env.PORT || 3000;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 10_000) reject(new ErroHttp(413, 'Corpo muito grande'));
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new ErroHttp(400, 'JSON inválido'));
      }
    });
  });
}

function estatico(res, pathname) {
  const arquivo = path.normalize(path.join(PUBLIC, pathname === '/' ? 'index.html' : pathname));
  if (!arquivo.startsWith(PUBLIC + path.sep)) return json(res, 403, { erro: 'Acesso negado' });
  fs.readFile(arquivo, (err, conteudo) => {
    if (err) return json(res, 404, { erro: 'Não encontrado' });
    res.writeHead(200, { 'Content-Type': MIME[path.extname(arquivo)] || 'application/octet-stream' });
    res.end(conteudo);
  });
}

http
  .createServer(async (req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (!pathname.startsWith('/api/')) return estatico(res, pathname);

    const rota = routes.find(([m, p]) => m === req.method && p === pathname);
    if (!rota) return json(res, 404, { erro: 'Rota não encontrada' });
    try {
      const body = req.method === 'POST' ? await lerCorpo(req) : {};
      const { status, data } = rota[2]({ body });
      json(res, status, data);
    } catch (e) {
      if (e instanceof ErroHttp) return json(res, e.status, { erro: e.message });
      console.error(e);
      json(res, 500, { erro: 'Erro interno' });
    }
  })
  .listen(PORTA, () => console.log(`GreenSchool em http://localhost:${PORTA}`));
