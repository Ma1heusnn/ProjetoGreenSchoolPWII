# GreenSchool

MVP de sustentabilidade escolar: cadastro de alunos, registro de ações sustentáveis, campanhas e ranking. Uma planta na tela inicial cresce conforme os pontos da escola.

## Como rodar

Requer Node.js 20 ou superior. Não há dependências para instalar.

```
node server.js
```

Abra http://localhost:3000. Para outra porta: `PORT=3001 node server.js`.

Os dados ficam em `data/db.json`, criado no primeiro uso.

## Estrutura (MVC)

```
server.js               servidor HTTP e arquivos estáticos
src/models/             dados e regras (usuário, ação, campanha)
src/controllers/        recebem a requisição e chamam os models
src/routes.js           mapa de rotas da API
public/js/model.js      chamadas à API
public/js/view.js       telas e animações
public/js/controller.js navegação e formulários
```

## Pontuação

Cada tipo de ação vale um número de pontos, multiplicado pela quantidade (1 a 20). Os valores estão em `TIPOS`, em `src/models/acao.js`.

## API

| Método | Rota | Descrição |
| --- | --- | --- |
| GET, POST | `/api/usuarios` | Lista e cadastra alunos |
| GET | `/api/tipos` | Tipos de ação e pontos |
| GET, POST | `/api/acoes` | Lista e registra ações |
| GET, POST | `/api/campanhas` | Lista (com progresso) e cria campanhas |
| GET | `/api/ranking` | Ranking de alunos e turmas, com resumo |

## GitHub Pages

O Pages só serve arquivos estáticos, então a pasta `public/` é publicada sem o servidor. Nesse caso o `model.js` detecta que não há API e usa `public/js/local.js`, que guarda os dados no `localStorage` do próprio navegador (cada visitante vê só os seus dados). As regras de pontuação de `local.js` espelham as de `src/models`.
