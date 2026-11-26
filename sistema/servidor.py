"""Ponto de entrada da versao web (usada no Docker).

Local:      python servidor.py        -> http://localhost:8000
Container:  gunicorn --preload -b 0.0.0.0:8000 servidor:app
"""

import os

from app.web import criar_app

app = criar_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), debug=False)
