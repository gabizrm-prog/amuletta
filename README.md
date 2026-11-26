# Amuletta

Projeto Integrador (Senac) — loja virtual de acessórios femininos **Amuletta** e o sistema da equipe da loja, empacotados juntos numa imagem **Docker**.

| Parte | O que é | Onde |
|---|---|---|
| Loja virtual | Site em HTML, CSS e JavaScript (catálogo, busca, favoritos, sacola, checkout) | raiz do repositório · [ver online](https://gabizrm-prog.github.io/amuletta/) |
| Sistema da equipe | Python + Flask + SQLite: **login** e **cadastro de produtos** (incluir, consultar, alterar, excluir) | [`sistema/`](sistema/) |

Quando roda no container, a loja lê o catálogo do banco de dados: o que a equipe cadastra no sistema aparece na loja (produtos com estoque 0 saem da vitrine). No GitHub Pages, sem o servidor, o site usa a lista fixa do protótipo.

## Executar com Docker

```bash
docker build -t amuletta .
docker container run -d -p 8000:8000 --name amuletta amuletta
```

- Loja: http://localhost:8000
- Login da equipe: http://localhost:8000/admin

| E-mail | Senha | Perfil |
|---|---|---|
| admin@amuletta.com | admin123 | admin |
| loja@amuletta.com | loja123 | funcionario |

Para manter os dados ao recriar o container, use um volume: `docker container run -d -p 8000:8000 -v amuletta-dados:/app/dados --name amuletta amuletta`.

Parar e remover: `docker container stop amuletta` e `docker container rm amuletta`.

## Executar sem Docker

```bash
cd sistema
pip install -r requirements.txt
python servidor.py          # http://localhost:8000
python -m unittest -v       # 19 testes
```

## Estrutura

```
Dockerfile                 receita da imagem (python:3.12-slim + gunicorn)
.dockerignore              o que não entra na imagem
index.html, app.js,        loja virtual (site estático)
estilo.css, loja-api.js    loja-api.js busca o catálogo no banco quando há servidor
documentacao.html, telas/  documentação e prints do protótipo da loja
sistema/
  servidor.py              ponto de entrada da versão web
  app/web.py               rotas Flask: login, cadastro de produtos, API e loja
  app/templates/           telas HTML (login e produtos)
  app/static/admin.css     estilo do sistema
  app/auth.py              login (senha com hash PBKDF2-SHA256 + salt)
  app/produtos.py          CRUD de produtos + validações
  app/banco.py             conexão SQLite, tabelas e dados iniciais
  schema.sql               DDL das tabelas
  tests/                   testes automatizados (unittest)
  main.py, app/telas.py    versão desktop anterior (Tkinter)
  docs/                    relatórios e prints
.github/workflows/         CI: roda os testes, gera a imagem e testa o container
```

## Histórico

Este repositório juntou o antigo [`amuletta-sistema`](https://github.com/gabizrm-prog/amuletta-sistema), que agora fica na pasta `sistema/` com o histórico de commits preservado.
