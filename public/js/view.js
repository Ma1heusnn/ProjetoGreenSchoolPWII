// View: só gera HTML e anima. Não faz requisições.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const raiz = document.getElementById('conteudo');
const cores = ['azul', 'pessego', 'lilas', 'ciano'];
const data = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
const vazio = (txt) => `<p class="vazio">${txt}</p>`;
const cabecalho = (titulo, sub) => `<header class="topo"><h1>${titulo}</h1><p>${sub}</p></header>`;
const opcoes = (lista, rotulo) => lista.map((i) => `<option value="${esc(i.id ?? i.chave)}">${esc(rotulo(i))}</option>`).join('');
const nomeDe = (usuarios, id) => usuarios.find((u) => u.id === id)?.nome ?? 'Aluno removido';

// A planta da escola cresce conforme os pontos acumulados.
const NIVEIS = [
  { min: 0, nome: 'Semente' },
  { min: 30, nome: 'Broto' },
  { min: 120, nome: 'Muda' },
  { min: 300, nome: 'Arbusto' },
  { min: 600, nome: 'Árvore' },
];
const FOLHA = 'M0 0C14-22 40-22 50-6C36 8 12 10 0 0Z';

function planta(n) {
  const base = '<ellipse class="terra" cx="100" cy="206" rx="64" ry="12"/>';
  const abre = `<svg class="planta" viewBox="0 0 200 220" role="img" aria-label="Planta da escola no nível ${NIVEIS[n].nome}">`;
  if (n === 0) return `${abre}${base}<ellipse class="semente" cx="100" cy="196" rx="8" ry="11"/></svg>`;

  const altura = 18 + n * 38;
  const topo = 200 - altura;
  const qtd = n * 2;
  const folhas = Array.from({ length: qtd }, (_, i) => {
    const y = 192 - (i + 0.7) * ((altura - 14) / qtd);
    const lado = i % 2 ? -1 : 1;
    const tam = 1.15 - (i / qtd) * 0.5;
    return `<g transform="translate(100 ${y.toFixed(1)}) scale(${(lado * tam).toFixed(2)} ${tam.toFixed(2)}) rotate(-12)"><path class="folha${i % 4 > 1 ? ' par' : ''}" style="--i:${i}" d="${FOLHA}"/></g>`;
  }).join('');
  const ponta = `<g transform="translate(100 ${topo}) rotate(-80) scale(.8)"><path class="folha" style="--i:${qtd}" d="${FOLHA}"/></g>`;
  return `${abre}${base}<g class="balanca"><path class="caule" pathLength="1" d="M100 202C96 ${topo + altura * 0.55} 104 ${topo + altura * 0.3} 100 ${topo}"/>${folhas}${ponta}</g></svg>`;
}

function destaque(pontos) {
  const n = NIVEIS.findLastIndex((x) => pontos >= x.min);
  const atual = NIVEIS[n];
  const prox = NIVEIS[n + 1];
  const faixa = prox ? prox.min - atual.min : 1;
  const valor = prox ? pontos - atual.min : 1;
  return `
    <section class="hero">
      <div class="hero-texto">
        <span class="etiqueta">Pontos da escola</span>
        <strong class="hero-numero" data-conta="${pontos}">0</strong>
        <p>Nível <b>${atual.nome}</b>${prox ? ` · faltam ${prox.min - pontos} pts para ${prox.nome}` : ' · nível máximo'}</p>
        <progress max="${faixa}" value="0" data-valor="${valor}" aria-label="Progresso até o próximo nível"></progress>
      </div>
      ${planta(n)}
    </section>`;
}

const telas = {
  visao({ ranking, acoes, usuarios, tipos }) {
    const top = ranking.alunos.slice(0, 3);
    const { resumo } = ranking;
    const media = resumo.alunos ? Math.round(resumo.pontos / resumo.alunos) : 0;
    return `
      ${cabecalho('Visão geral', 'Como a escola está cuidando do planeta.')}
      ${destaque(resumo.pontos)}
      <section class="grade tres">
        <article class="card numero"><span>Alunos</span><strong data-conta="${resumo.alunos}">0</strong></article>
        <article class="card numero"><span>Ações registradas</span><strong data-conta="${resumo.acoes}">0</strong></article>
        <article class="card numero"><span>Pontos por aluno</span><strong data-conta="${media}">0</strong></article>
      </section>
      <section class="grade dois">
        <article class="card">
          <h2>Mais engajados</h2>
          ${top.length ? `<ol class="lista">${top.map((a, i) => `<li><span class="pos">${i + 1}</span><span>${esc(a.nome)}<small>${esc(a.turma)}</small></span><b>${a.pontos} pts</b></li>`).join('')}</ol>` : vazio('Cadastre alunos para começar.')}
        </article>
        <article class="card">
          <h2>Últimas ações</h2>
          ${acoes.length ? `<ul class="lista">${acoes.slice(0, 5).map((a) => `<li><span>${esc(nomeDe(usuarios, a.usuarioId))}<small>${esc(tipos[a.tipo].rotulo)} · ${data(a.criadaEm)}</small></span><b>+${a.pontos}</b></li>`).join('')}</ul>` : vazio('Nenhuma ação registrada ainda.')}
        </article>
      </section>`;
  },

  alunos({ usuarios }) {
    return `
      ${cabecalho('Alunos', 'Cadastre quem vai participar.')}
      <section class="grade dois">
        <form class="card form" data-form="aluno">
          <h2>Novo aluno</h2>
          <label>Nome<input name="nome" maxlength="60" required autocomplete="off"></label>
          <label>Turma<input name="turma" maxlength="20" placeholder="Ex.: 2A" required autocomplete="off"></label>
          <button class="botao">Cadastrar</button>
        </form>
        <article class="card">
          <h2>Cadastrados (${usuarios.length})</h2>
          ${usuarios.length ? `<ul class="lista">${usuarios.map((u) => `<li><span>${esc(u.nome)}</span><small>${esc(u.turma)}</small></li>`).join('')}</ul>` : vazio('Nenhum aluno cadastrado.')}
        </article>
      </section>`;
  },

  acoes({ usuarios, tipos, campanhas, acoes }) {
    const listaTipos = Object.entries(tipos).map(([chave, t]) => ({ chave, ...t }));
    if (!usuarios.length) return `${cabecalho('Ações', 'Registre o que foi feito.')}<article class="card">${vazio('Cadastre um aluno antes de registrar ações.')}</article>`;
    return `
      ${cabecalho('Ações', 'Registre o que foi feito.')}
      <section class="grade dois">
        <form class="card form" data-form="acao">
          <h2>Nova ação</h2>
          <label>Aluno<select name="usuarioId" required>${opcoes(usuarios, (u) => `${u.nome} (${u.turma})`)}</select></label>
          <label>Tipo<select name="tipo" required>${opcoes(listaTipos, (t) => `${t.rotulo} · ${t.pontos} pts`)}</select></label>
          <label>Quantidade<input name="quantidade" type="number" min="1" max="20" value="1" required></label>
          <label>Campanha (opcional)<select name="campanhaId"><option value="">Nenhuma</option>${opcoes(campanhas, (c) => c.nome)}</select></label>
          <button class="botao">Registrar</button>
        </form>
        <article class="card">
          <h2>Histórico</h2>
          ${acoes.length ? `<ul class="lista">${acoes.slice(0, 8).map((a) => `<li><span>${esc(nomeDe(usuarios, a.usuarioId))}<small>${esc(tipos[a.tipo].rotulo)} ×${a.quantidade} · ${data(a.criadaEm)}</small></span><b>+${a.pontos}</b></li>`).join('')}</ul>` : vazio('Nenhuma ação registrada.')}
        </article>
      </section>`;
  },

  campanhas({ campanhas }) {
    return `
      ${cabecalho('Campanhas', 'Metas coletivas da escola.')}
      <section class="grade campanhas">
        ${campanhas.map((c, i) => {
          const pct = Math.min(100, Math.round((c.pontos / c.meta) * 100));
          return `<article class="card cor-${cores[i % cores.length]}">
            <h2>${esc(c.nome)}</h2>
            <p>${esc(c.descricao)}</p>
            <progress max="${c.meta}" value="0" data-valor="${Math.min(c.pontos, c.meta)}" aria-label="Progresso: ${esc(c.nome)}">${pct}%</progress>
            <div class="rodape"><span>${c.pontos} / ${c.meta} pts</span><span>${c.participantes} alunos</span></div>
          </article>`;
        }).join('')}
      </section>
      <section>
        <form class="card form linha" data-form="campanha">
          <h2>Nova campanha</h2>
          <label>Nome<input name="nome" maxlength="60" required autocomplete="off"></label>
          <label>Descrição<input name="descricao" maxlength="140" required autocomplete="off"></label>
          <label>Meta (pontos)<input name="meta" type="number" min="10" max="100000" value="100" required></label>
          <button class="botao">Criar</button>
        </form>
      </section>`;
  },

  ranking({ ranking }) {
    const { alunos, turmas } = ranking;
    return `
      ${cabecalho('Ranking', 'Quem mais contribuiu até agora.')}
      <section class="grade dois">
        <article class="card">
          <h2>Alunos</h2>
          ${alunos.length ? `<ol class="lista">${alunos.map((a, i) => `<li><span class="pos">${i + 1}</span><span>${esc(a.nome)}<small>${esc(a.turma)} · ${a.acoes} ações</small></span><b>${a.pontos} pts</b></li>`).join('')}</ol>` : vazio('Sem alunos ainda.')}
        </article>
        <article class="card">
          <h2>Turmas</h2>
          ${turmas.length ? `<ol class="lista">${turmas.map((t, i) => `<li><span class="pos">${i + 1}</span><span>${esc(t.turma)}<small>${t.alunos} alunos</small></span><b>${t.pontos} pts</b></li>`).join('')}</ol>` : vazio('Sem turmas ainda.')}
        </article>
      </section>`;
  },
};

function animar() {
  raiz.querySelectorAll('[data-conta]').forEach((el) => {
    const alvo = Number(el.dataset.conta);
    const ini = performance.now();
    const passo = (t) => {
      const p = Math.min(1, (t - ini) / 900);
      el.textContent = Math.round(alvo * (1 - (1 - p) ** 3));
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  });
  // dois frames: garante que o valor 0 foi pintado antes da transição
  requestAnimationFrame(() =>
    requestAnimationFrame(() => raiz.querySelectorAll('progress[data-valor]').forEach((el) => (el.value = el.dataset.valor))),
  );
}

export const view = {
  render(tela, dados) {
    raiz.innerHTML = telas[tela](dados); // a entrada é animada por @starting-style no CSS
    animar();
    document.querySelectorAll('#menu a').forEach((a) => a.classList.toggle('ativo', a.dataset.rota === tela));
  },

  toast(msg, erro = false) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `mostra${erro ? ' erro' : ''}`;
    clearTimeout(view._t);
    view._t = setTimeout(() => (el.className = ''), 2600);
  },
};
