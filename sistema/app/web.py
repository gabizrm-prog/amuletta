"""Versao web do sistema administrativo (Flask).

Rotas:
  /                      loja virtual (site estatico da pasta da loja)
  /admin/login           tela de login da equipe
  /admin/produtos        processo de negocio: cadastro de produtos (incluir, consultar, alterar, excluir)
  /api/produtos          produtos com estoque, em JSON, lidos pelo catalogo da loja
"""

import os
import secrets
from functools import wraps
from pathlib import Path

from flask import (Flask, abort, flash, jsonify, redirect, render_template, request,
                   send_from_directory, session, url_for)

from app import auth, banco, produtos
from app.produtos import Produto

# Pasta com o site da loja (index.html, app.js, estilo.css...). No container fica em /app/loja;
# rodando direto do repositorio, e a pasta acima de sistema/.
PASTA_LOJA = Path(os.environ.get("AMULETTA_LOJA", banco.RAIZ.parent))
EXTENSOES_LOJA = {".html", ".js", ".css", ".png", ".jpg", ".jpeg", ".svg", ".ico", ".webp"}


def _parcelas(preco: float) -> int:
    """Mesma regra de parcelamento usada no catalogo do site."""
    if preco <= 90:
        return 2
    if preco <= 150:
        return 3
    return 5


def criar_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.environ.get("AMULETTA_SECRET_KEY") or secrets.token_hex(32)
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    banco.inicializar()

    # ---------- Seguranca ----------
    def login_obrigatorio(view):
        @wraps(view)
        def protegida(*args, **kwargs):
            if "usuario" not in session:
                flash("Entre com seu usuário para acessar o sistema.", "aviso")
                return redirect(url_for("login"))
            return view(*args, **kwargs)
        return protegida

    def token_csrf() -> str:
        if "csrf" not in session:
            session["csrf"] = secrets.token_hex(16)
        return session["csrf"]

    app.jinja_env.globals["token_csrf"] = token_csrf

    @app.before_request
    def conferir_csrf():
        if request.method == "POST":
            enviado = request.form.get("csrf", "")
            if not session.get("csrf") or not secrets.compare_digest(enviado, session["csrf"]):
                abort(400, "Formulário expirado. Recarregue a página e tente de novo.")

    @app.template_filter("brl")
    def brl(valor: float) -> str:
        return f"R$ {valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

    # ---------- Login ----------
    @app.route("/admin/")
    def admin():
        return redirect(url_for("produtos_lista" if "usuario" in session else "login"))

    @app.route("/admin/login", methods=["GET", "POST"])
    def login():
        email = ""
        if request.method == "POST":
            email = request.form.get("email", "")
            try:
                usuario = auth.autenticar(email, request.form.get("senha", ""))
            except auth.ErroAutenticacao as erro:
                flash(str(erro), "erro")
            else:
                session.clear()
                session["usuario"] = {"id": usuario.id, "nome": usuario.nome, "perfil": usuario.perfil}
                return redirect(url_for("produtos_lista"))
        return render_template("login.html", email=email)

    @app.post("/admin/sair")
    def sair():
        session.clear()
        flash("Você saiu do sistema.", "ok")
        return redirect(url_for("login"))

    # ---------- Processo de negocio: cadastro de produtos ----------
    def _produto_do_formulario(produto_id: int | None = None) -> Produto:
        f = request.form
        texto_preco = f.get("preco", "").replace("R$", "").strip()
        if "," in texto_preco:  # formato brasileiro: 1.299,90
            texto_preco = texto_preco.replace(".", "").replace(",", ".")
        try:
            preco = float(texto_preco)
        except ValueError:
            raise ValueError("Informe um preço válido (ex.: 129,90).") from None
        try:
            estoque = int(f.get("estoque", ""))
        except ValueError:
            raise ValueError("Informe o estoque como número inteiro.") from None
        try:
            categoria_id = int(f.get("categoria_id", ""))
        except ValueError:
            raise ValueError("Selecione uma categoria válida.") from None
        return Produto(
            id=produto_id, nome=f.get("nome", ""), descricao=f.get("descricao", ""),
            categoria_id=categoria_id, preco=preco, estoque=estoque, lancamento="lancamento" in f,
        )

    def _tela(form: dict | None = None, editando: int | None = None, status: int = 200):
        busca = request.args.get("q", "")
        cat = request.args.get("categoria", type=int)
        return render_template(
            "produtos.html",
            itens=produtos.consultar(busca, cat), categorias=produtos.listar_categorias(),
            busca=busca, categoria_filtro=cat, form=form or {}, editando=editando,
        ), status

    @app.get("/admin/produtos")
    @login_obrigatorio
    def produtos_lista():
        editar = request.args.get("editar", type=int)
        if editar:
            p = produtos.buscar_por_id(editar)
            if p is None:
                flash("Produto não encontrado.", "erro")
                return redirect(url_for("produtos_lista"))
            form = {"nome": p.nome, "descricao": p.descricao, "categoria_id": p.categoria_id,
                    "preco": f"{p.preco:.2f}".replace(".", ","), "estoque": p.estoque, "lancamento": p.lancamento}
            return _tela(form, editar)
        return _tela()

    @app.post("/admin/produtos")
    @login_obrigatorio
    def produtos_incluir():
        try:
            novo_id = produtos.incluir(_produto_do_formulario())
        except ValueError as erro:
            flash(str(erro), "erro")
            return _tela(dict(request.form), status=422)
        flash(f"Produto incluído (código {novo_id}).", "ok")
        return redirect(url_for("produtos_lista"))

    @app.post("/admin/produtos/<int:produto_id>")
    @login_obrigatorio
    def produtos_alterar(produto_id: int):
        try:
            produtos.alterar(_produto_do_formulario(produto_id))
        except ValueError as erro:
            flash(str(erro), "erro")
            return _tela(dict(request.form), produto_id, status=422)
        flash("Alterações salvas.", "ok")
        return redirect(url_for("produtos_lista"))

    @app.post("/admin/produtos/<int:produto_id>/excluir")
    @login_obrigatorio
    def produtos_excluir(produto_id: int):
        try:
            produtos.excluir(produto_id)
        except ValueError as erro:
            flash(str(erro), "erro")
        else:
            flash("Produto excluído.", "ok")
        return redirect(url_for("produtos_lista"))

    # ---------- API lida pela loja ----------
    @app.get("/api/produtos")
    def api_produtos():
        lista = [p for p in produtos.consultar() if p["estoque"] > 0]
        lista.sort(key=lambda p: p["id"])
        return jsonify([
            {"id": p["id"], "name": p["nome"], "cat": p["categoria"], "price": p["preco"],
             "parcelas": _parcelas(p["preco"]), "isNew": bool(p["lancamento"]), "rank": i + 1,
             "desc": p["descricao"], "estoque": p["estoque"]}
            for i, p in enumerate(lista)
        ])

    # ---------- Loja virtual (arquivos estaticos) ----------
    @app.get("/")
    def loja():
        return send_from_directory(PASTA_LOJA, "index.html")

    @app.get("/<path:arquivo>")
    def loja_arquivo(arquivo: str):
        caminho = Path(arquivo)
        if caminho.parts[0] in ("sistema", ".git", ".github") or caminho.suffix.lower() not in EXTENSOES_LOJA:
            abort(404)
        return send_from_directory(PASTA_LOJA, arquivo)

    return app
