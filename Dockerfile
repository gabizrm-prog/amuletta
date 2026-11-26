# Imagem da aplicação Amuletta: loja virtual + sistema da equipe (login e cadastro de produtos)
# Gerar a imagem:      docker build -t amuletta .
# Executar o container: docker container run -d -p 8000:8000 --name amuletta amuletta
# Abrir no navegador:   http://localhost:8000  (loja)  e  http://localhost:8000/admin  (login)

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    AMULETTA_LOJA=/app/loja \
    AMULETTA_DB=/app/dados/amuletta.db

WORKDIR /app

# 1) Dependências primeiro, para o Docker reaproveitar essa camada quando só o código muda
COPY sistema/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2) Código do sistema (Python + SQLite) e site da loja (HTML, CSS, JS)
COPY sistema/ ./
COPY index.html app.js estilo.css loja-api.js documentacao.html ./loja/
COPY telas/ ./loja/telas/

# 3) Usuário sem privilégios de administrador e pasta do banco de dados
RUN useradd --create-home amuletta && mkdir -p /app/dados && chown amuletta /app/dados
USER amuletta
VOLUME /app/dados

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/admin/login')" || exit 1

# O banco é criado (com os dados iniciais) na primeira vez que o container sobe
CMD ["gunicorn", "--preload", "--workers", "2", "--bind", "0.0.0.0:8000", "servidor:app"]
