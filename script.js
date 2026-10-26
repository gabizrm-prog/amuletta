// Ícones de cada categoria (mesmo traço do protótipo)
const ICONS = {
  'Colares': '<path d="M24 26 Q60 100 96 26"/><path d="M60 63 V70"/><path d="M60 94 L47 80 A7 7 0 0 1 60 72 A7 7 0 0 1 73 80 Z"/>',
  'Brincos': '<circle cx="42" cy="32" r="5"/><path d="M42 37 V54"/><path d="M42 54 C32 68 34 84 42 84 C50 84 52 68 42 54 Z"/><circle cx="78" cy="32" r="5"/><path d="M78 37 V54"/><path d="M78 54 C68 68 70 84 78 84 C86 84 88 68 78 54 Z"/>',
  'Anéis': '<circle cx="60" cy="72" r="26"/><path d="M50 46 L54 36 H66 L70 46 L60 54 Z"/>',
  'Pulseiras': '<ellipse cx="60" cy="64" rx="38" ry="22"/><g fill="currentColor"><circle cx="22" cy="64" r="5"/><circle cx="98" cy="64" r="5"/><circle cx="60" cy="42" r="5"/><circle cx="60" cy="86" r="5"/><circle cx="33" cy="48" r="5"/><circle cx="87" cy="48" r="5"/><circle cx="33" cy="80" r="5"/><circle cx="87" cy="80" r="5"/></g>',
  'Bolsas': '<rect x="28" y="50" width="64" height="46" rx="8"/><path d="M44 50 V42 A16 16 0 0 1 76 42 V50"/><path d="M28 64 H92"/>',
  'Cabelo': '<path d="M60 58 L28 40 V76 Z"/><path d="M60 58 L92 40 V76 Z"/><circle cx="60" cy="58" r="6"/><path d="M56 64 L48 92"/><path d="M64 64 L72 92"/>'
};

const icon = (cat, strokeWidth) =>
  `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[cat]}</svg>`;

// "rank" = posição em mais vendidos
const PRODUCTS = [
  { id: 1, name: 'Colar Coração Rubi', cat: 'Colares', price: 129.90, parcelas: 3, isNew: true, rank: 1 },
  { id: 2, name: 'Brinco Gota Carmim', cat: 'Brincos', price: 89.90, parcelas: 3, isNew: false, rank: 3 },
  { id: 3, name: 'Anel Solitário Rosé', cat: 'Anéis', price: 99.90, parcelas: 3, isNew: true, rank: 5 },
  { id: 4, name: 'Pulseira Pérolas Duo', cat: 'Pulseiras', price: 79.90, parcelas: 2, isNew: false, rank: 2 },
  { id: 5, name: 'Bolsa Mini Cereja', cat: 'Bolsas', price: 219.90, parcelas: 5, isNew: false, rank: 7 },
  { id: 6, name: 'Laço de Cabelo Carmim', cat: 'Cabelo', price: 59.90, parcelas: 2, isNew: true, rank: 6 },
  { id: 7, name: 'Colar Amuleto Estrela', cat: 'Colares', price: 149.90, parcelas: 3, isNew: false, rank: 4 },
  { id: 8, name: 'Brinco Argola Fina', cat: 'Brincos', price: 69.90, parcelas: 2, isNew: false, rank: 8 }
];

const CATEGORIES = ['Colares', 'Brincos', 'Anéis', 'Pulseiras', 'Bolsas', 'Cabelo'];
const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const state = { filter: 'Todos', sort: 'vendidos', query: '', added: new Set(), favs: new Set() };

const $ = (sel) => document.querySelector(sel);
const grid = $('#product-grid');
const pillsEl = $('#pills');
const catGrid = $('#cat-grid');
const countLabel = $('#count-label');
const emptyEl = $('#empty');
const cartCount = $('#cart-count');
const sortSelect = $('#ordenar');
const toast = $('#toast');
const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

function visibleProducts() {
  const q = norm(state.query.trim());
  let list = PRODUCTS.filter((p) => {
    if (state.filter === 'Novidades' && !p.isNew) return false;
    if (CATEGORIES.includes(state.filter) && p.cat !== state.filter) return false;
    if (q && !norm(p.name + ' ' + p.cat).includes(q)) return false;
    return true;
  });
  const sorters = {
    vendidos: (a, b) => a.rank - b.rank,
    novidades: (a, b) => (b.isNew - a.isNew) || (a.rank - b.rank),
    menor: (a, b) => a.price - b.price,
    maior: (a, b) => b.price - a.price
  };
  return list.sort(sorters[state.sort]);
}

function renderProducts() {
  const list = visibleProducts();
  const addLabel = isMobile() ? 'Adicionar' : 'Adicionar à sacola';
  grid.innerHTML = list.map((p) => {
    const added = state.added.has(p.id);
    const fav = state.favs.has(p.id);
    return `
      <article class="product">
        <div class="product-media">
          ${p.isNew ? '<span class="badge-new">NOVO</span>' : ''}
          <button type="button" class="fav-btn" data-fav="${p.id}" aria-label="Favoritar ${p.name}" aria-pressed="${fav}">
            <svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>
          </button>
          ${icon(p.cat, isMobile() ? 2.8 : 2.4)}
        </div>
        <div class="product-info">
          <span class="product-cat">${p.cat}</span>
          <span class="product-name">${p.name}</span>
          <div class="product-price">
            <span class="price">${brl(p.price)}</span>
            <span class="installments">ou ${p.parcelas}x de ${brl(Math.round(p.price / p.parcelas * 100) / 100)}</span>
          </div>
        </div>
        <button type="button" class="add-btn${added ? ' added' : ''}" data-add="${p.id}">${added ? 'Na sacola ✓' : addLabel}</button>
      </article>`;
  }).join('');
  const n = list.length;
  countLabel.textContent = n + (n === 1 ? ' produto' : ' produtos');
  emptyEl.hidden = n > 0;
}

function renderFilters() {
  pillsEl.innerHTML = ['Todos', 'Novidades', ...CATEGORIES].map((label) =>
    `<button type="button" class="pill" data-filter="${label}" aria-pressed="${state.filter === label}">${label}</button>`
  ).join('');
  catGrid.innerHTML = CATEGORIES.map((label) =>
    `<button type="button" class="cat-tile${state.filter === label ? ' active' : ''}" data-filter="${label}">
      <span class="cat-circle">${icon(label, 3)}</span>${label}
    </button>`
  ).join('');
}

function render() {
  renderFilters();
  renderProducts();
  cartCount.textContent = state.added.size;
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove('show'), 2200);
}

function setFilter(label) {
  state.filter = label;
  render();
}

// Delegação de cliques: filtros, sacola, favoritos
document.addEventListener('click', (e) => {
  const filterEl = e.target.closest('[data-filter]');
  if (filterEl) {
    setFilter(filterEl.dataset.filter);
    closeMenu();
    if (filterEl.matches('.cat-tile')) $('#catalogo').scrollIntoView();
    return;
  }
  const sortEl = e.target.closest('[data-sort]');
  if (sortEl) {
    state.sort = sortSelect.value = sortEl.dataset.sort;
    render();
    return;
  }
  const addEl = e.target.closest('[data-add]');
  if (addEl) {
    const id = Number(addEl.dataset.add);
    const p = PRODUCTS.find((x) => x.id === id);
    if (state.added.has(id)) {
      state.added.delete(id);
      showToast(`${p.name} removido da sacola`);
    } else {
      state.added.add(id);
      showToast(`${p.name} adicionado à sacola`);
      cartCount.classList.add('bump');
      setTimeout(() => cartCount.classList.remove('bump'), 200);
    }
    render();
    return;
  }
  const favEl = e.target.closest('[data-fav]');
  if (favEl) {
    const id = Number(favEl.dataset.fav);
    state.favs.has(id) ? state.favs.delete(id) : state.favs.add(id);
    renderProducts();
  }
});

sortSelect.addEventListener('change', () => {
  state.sort = sortSelect.value;
  renderProducts();
});

// As duas buscas (desktop e mobile) ficam sincronizadas
document.querySelectorAll('.search-input').forEach((input) => {
  input.addEventListener('input', () => {
    state.query = input.value;
    document.querySelectorAll('.search-input').forEach((other) => { if (other !== input) other.value = input.value; });
    renderProducts();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#catalogo').scrollIntoView();
  });
});

// Menu mobile
const menuBtn = $('.menu-btn');
const nav = $('#main-nav');
function closeMenu() {
  nav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

$('.cart-btn').addEventListener('click', () => {
  const n = state.added.size;
  showToast(n ? `Sua sacola tem ${n} ${n === 1 ? 'item' : 'itens'}` : 'Sua sacola está vazia');
});

$('#newsletter-form').addEventListener('submit', (e) => {
  e.preventDefault();
  e.target.reset();
  showToast('Pronto! Você vai receber nossas novidades.');
});

// Re-renderiza ao cruzar o breakpoint (rótulo do botão e traço dos ícones mudam)
window.matchMedia('(max-width: 900px)').addEventListener('change', renderProducts);

render();
