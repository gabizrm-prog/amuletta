"""Mostra o conteúdo do banco SQLite (usado dentro do container: docker exec amuletta python ver_banco.py)."""
import os, sqlite3

banco = os.environ.get("AMULETTA_DB", "amuletta.db")
con = sqlite3.connect(banco)
print(f"Banco: {banco}\n")
for tabela, colunas in [("usuarios", "id, nome, email, perfil, ativo"),
                        ("categorias", "id, nome"),
                        ("produtos", "id, nome, categoria_id, preco, estoque, lancamento")]:
    linhas = con.execute(f"SELECT {colunas} FROM {tabela}").fetchall()
    print(f"== {tabela} ({len(linhas)} registros) ==")
    print("  " + " | ".join(c.strip() for c in colunas.split(",")))
    for l in linhas:
        print("  " + " | ".join(str(v) for v in l))
    print()
