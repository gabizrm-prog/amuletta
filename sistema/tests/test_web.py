"""Testes da versao web: tela de login e processo de cadastro de produtos pelo navegador."""

import os
import re
import tempfile
import unittest
from pathlib import Path


class TesteWeb(unittest.TestCase):
    def setUp(self):
        self.pasta = tempfile.TemporaryDirectory()
        os.environ["AMULETTA_DB"] = str(Path(self.pasta.name) / "teste.db")
        from app.web import criar_app
        self.app = criar_app()
        self.app.testing = True
        self.cliente = self.app.test_client()

    def tearDown(self):
        os.environ.pop("AMULETTA_DB", None)
        self.pasta.cleanup()

    def csrf(self, url):
        html = self.cliente.get(url).get_data(as_text=True)
        return re.search(r'name="csrf" value="([0-9a-f]+)"', html).group(1)

    def entrar(self, email="admin@amuletta.com", senha="admin123"):
        token = self.csrf("/admin/login")
        return self.cliente.post("/admin/login", data={"email": email, "senha": senha, "csrf": token})

    def test_tela_de_login_abre(self):
        resposta = self.cliente.get("/admin/login")
        self.assertEqual(resposta.status_code, 200)
        self.assertIn("Entrar", resposta.get_data(as_text=True))

    def test_login_errado_mostra_mensagem(self):
        resposta = self.entrar(senha="errada")
        self.assertEqual(resposta.status_code, 200)
        self.assertIn("E-mail ou senha incorretos.", resposta.get_data(as_text=True))

    def test_produtos_exige_login(self):
        resposta = self.cliente.get("/admin/produtos")
        self.assertEqual(resposta.status_code, 302)
        self.assertIn("/admin/login", resposta.headers["Location"])

    def test_post_sem_csrf_e_recusado(self):
        resposta = self.cliente.post("/admin/login", data={"email": "admin@amuletta.com", "senha": "admin123"})
        self.assertEqual(resposta.status_code, 400)

    def test_login_certo_abre_cadastro(self):
        resposta = self.entrar()
        self.assertEqual(resposta.status_code, 302)
        tela = self.cliente.get("/admin/produtos").get_data(as_text=True)
        self.assertIn("Cadastro de produtos", tela)
        self.assertIn("Colar Coração Rubi", tela)

    def test_processo_completo_incluir_alterar_excluir(self):
        self.entrar()
        token = self.csrf("/admin/produtos")
        dados = {"csrf": token, "nome": "Tornozeleira Coral", "categoria_id": "4", "preco": "49,90",
                 "estoque": "7", "descricao": "Tornozeleira de miçangas.", "lancamento": "on"}
        self.assertEqual(self.cliente.post("/admin/produtos", data=dados).status_code, 302)

        # aparece na API lida pela loja
        loja = {p["name"]: p for p in self.cliente.get("/api/produtos").get_json()}
        self.assertIn("Tornozeleira Coral", loja)
        novo = loja["Tornozeleira Coral"]
        self.assertEqual((novo["price"], novo["cat"], novo["isNew"]), (49.9, "Pulseiras", True))

        # alterar: estoque zerado tira o produto da loja
        dados.update(estoque="0", preco="59,90")
        self.assertEqual(self.cliente.post(f"/admin/produtos/{novo['id']}", data=dados).status_code, 302)
        self.assertNotIn("Tornozeleira Coral", [p["name"] for p in self.cliente.get("/api/produtos").get_json()])

        # excluir
        resposta = self.cliente.post(f"/admin/produtos/{novo['id']}/excluir", data={"csrf": token})
        self.assertEqual(resposta.status_code, 302)
        self.assertNotIn("Tornozeleira Coral", self.cliente.get("/admin/produtos").get_data(as_text=True))

    def test_validacao_preco_invalido(self):
        self.entrar()
        token = self.csrf("/admin/produtos")
        resposta = self.cliente.post("/admin/produtos", data={
            "csrf": token, "nome": "Teste", "categoria_id": "1", "preco": "0", "estoque": "1"})
        self.assertEqual(resposta.status_code, 422)
        self.assertIn("O preço precisa ser maior que zero.", resposta.get_data(as_text=True))

    def test_loja_e_servida_sem_expor_o_sistema(self):
        with self.cliente.get("/") as resposta:
            self.assertEqual(resposta.status_code, 200)
        self.assertEqual(self.cliente.get("/sistema/schema.sql").status_code, 404)
        self.assertEqual(self.cliente.get("/sistema/app/web.py").status_code, 404)


if __name__ == "__main__":
    unittest.main()
