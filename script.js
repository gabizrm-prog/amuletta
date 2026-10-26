// Arquivo antigo: o site passou a usar app.js. Se uma página antiga em cache carregar este arquivo,
// recarrega a página sem cache para buscar a versão atual.
location.replace(location.pathname + '?atualizado=' + Date.now() + location.hash);
