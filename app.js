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

const HEART = '<svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';

// "rank" = posição em mais vendidos
const PRODUCTS = [
  { id: 1, name: 'Colar Coração Rubi', cat: 'Colares', price: 129.90, parcelas: 3, isNew: true, rank: 1,
    desc: 'Corrente delicada com pingente de coração em tom rubi. Banhado a ouro 18k, comprimento de 45 cm com extensor.' },
  { id: 2, name: 'Brinco Gota Carmim', cat: 'Brincos', price: 89.90, parcelas: 3, isNew: false, rank: 3,
    desc: 'Brinco pendente em formato de gota com acabamento carmim brilhante. Leve, ideal para o dia todo.' },
  { id: 3, name: 'Anel Solitário Rosé', cat: 'Anéis', price: 99.90, parcelas: 3, isNew: true, rank: 5,
    desc: 'Anel solitário com pedra rosé lapidada. Aro fino ajustável, banhado a ouro rosé.' },
  { id: 4, name: 'Pulseira Pérolas Duo', cat: 'Pulseiras', price: 79.90, parcelas: 2, isNew: false, rank: 2,
    desc: 'Pulseira com pérolas sintéticas alternadas em dois tamanhos. Fecho de rosca e elástico reforçado.' },
  { id: 5, name: 'Bolsa Mini Cereja', cat: 'Bolsas', price: 219.90, parcelas: 5, isNew: false, rank: 7,
    desc: 'Bolsa mini estruturada em vermelho cereja, com alça de mão e alça transversal removível.' },
  { id: 6, name: 'Laço de Cabelo Carmim', cat: 'Cabelo', price: 59.90, parcelas: 2, isNew: true, rank: 6,
    desc: 'Laço de cetim carmim com presilha de metal. Fica lindo em rabos de cavalo e semi-presos.' },
  { id: 7, name: 'Colar Amuleto Estrela', cat: 'Colares', price: 149.90, parcelas: 3, isNew: false, rank: 4,
    desc: 'Colar com pingente de estrela cravejado de zircônias. O amuleto da coleção, para usar todo dia.' },
  { id: 8, name: 'Brinco Argola Fina', cat: 'Brincos', price: 69.90, parcelas: 2, isNew: false, rank: 8,
    desc: 'Argola fina de 3 cm, banhada a ouro 18k. Um clássico que combina com tudo.' }
];

const CATEGORIES = ['Colares', 'Brincos', 'Anéis', 'Pulseiras', 'Bolsas', 'Cabelo'];
const FRETE = 19.90;
const FRETE_GRATIS = 199;
const PAGAMENTOS = { pix: 'Pix', cartao: 'Cartão de crédito', boleto: 'Boleto' };

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const byId = (id) => PRODUCTS.find((p) => p.id === id);
const parcela = (p) => `ou ${p.parcelas}x de ${brl(Math.round(p.price / p.parcelas * 100) / 100)}`;

const state = {
  filter: 'Todos', sort: 'vendidos', query: '',
  cart: new Map(),      // id -> quantidade
  favs: new Set(),
  drawer: null,         // 'cart' | 'favs' | null
  step: 'cart',         // 'cart' | 'checkout' | 'done'
  order: null,
  modalId: null
};

const $ = (sel) => document.querySelector(sel);
const grid = $('#product-grid');
const pillsEl = $('#pills');
const catGrid = $('#cat-grid');
const countLabel = $('#count-label');
const emptyEl = $('#empty');
const cartCount = $('#cart-count');
const favCount = $('#fav-count');
const sortSelect = $('#ordenar');
const toast = $('#toast');
const drawer = $('#drawer');
const drawerTitle = $('#drawer-title');
const drawerBody = $('#drawer-body');
const drawerFoot = $('#drawer-foot');
const overlay = $('#overlay');
const modal = $('#product-modal');
const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

function totals() {
  let items = 0, sub = 0;
  for (const [id, q] of state.cart) { items += q; sub += byId(id).price * q; }
  const frete = sub === 0 || sub >= FRETE_GRATIS ? 0 : FRETE;
  return { items, sub, frete, total: sub + frete };
}

function visibleProducts() {
  const q = norm(state.query.trim());
  const list = PRODUCTS.filter((p) => {
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

/* ---------- Catálogo ---------- */

function renderProducts() {
  const list = visibleProducts();
  const addLabel = isMobile() ? 'Adicionar' : 'Adicionar à sacola';
  grid.innerHTML = list.map((p) => {
    const added = state.cart.has(p.id);
    const fav = state.favs.has(p.id);
    return `
      <article class="product">
        <div class="product-media">
          <button type="button" class="media-btn" data-open="${p.id}" aria-label="Ver detalhes de ${p.name}"></button>
          ${p.isNew ? '<span class="badge-new">NOVO</span>' : ''}
          <button type="button" class="fav-btn" data-fav="${p.id}" aria-label="Favoritar ${p.name}" aria-pressed="${fav}">${HEART}</button>
          ${icon(p.cat, isMobile() ? 2.8 : 2.4)}
        </div>
        <div class="product-info">
          <span class="product-cat">${p.cat}</span>
          <button type="button" class="product-name" data-open="${p.id}">${p.name}</button>
          <div class="product-price">
            <span class="price">${brl(p.price)}</span>
            <span class="installments">${parcela(p)}</span>
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

/* ---------- Detalhes do produto ---------- */

function renderModal() {
  const p = byId(state.modalId);
  if (!p) return;
  const added = state.cart.has(p.id);
  const fav = state.favs.has(p.id);
  modal.innerHTML = `
    <button type="button" class="icon-btn modal-close" data-close-modal aria-label="Fechar">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <div class="modal-grid">
      <div class="modal-media">
        ${p.isNew ? '<span class="badge-new">NOVO</span>' : ''}
        ${icon(p.cat, 2)}
      </div>
      <div class="modal-info">
        <span class="product-cat">${p.cat}</span>
        <h2 class="modal-name">${p.name}</h2>
        <div class="modal-price">
          <span class="price">${brl(p.price)}</span>
          <span class="installments">${parcela(p)} sem juros</span>
        </div>
        <p class="modal-desc">${p.desc}</p>
        <ul class="modal-perks">
          <li>Frete grátis acima de ${brl(FRETE_GRATIS)}</li>
          <li>Troca fácil em até 30 dias</li>
          <li>Embalagem para presente inclusa</li>
        </ul>
        <div class="modal-actions">
          <button type="button" class="add-btn${added ? ' added' : ''}" data-add="${p.id}">${added ? 'Na sacola ✓' : 'Adicionar à sacola'}</button>
          <button type="button" class="fav-btn fav-btn-lg" data-fav="${p.id}" aria-label="Favoritar ${p.name}" aria-pressed="${fav}">${HEART}</button>
        </div>
      </div>
    </div>`;
}

function openModal(id) {
  state.modalId = id;
  renderModal();
  if (!modal.open) modal.showModal();
}

function closeModal() {
  if (modal.open) modal.close();
}

/* ---------- Painel lateral: sacola, checkout, confirmação, favoritos ---------- */

const thumb = (p) => `<span class="line-thumb">${icon(p.cat, 3)}</span>`;

function emptyState(title, text) {
  return `
    <div class="empty-state">
      <span class="empty-icon">${HEART}</span>
      <strong>${title}</strong>
      <span class="muted">${text}</span>
      <button type="button" class="btn btn-solid" data-close-drawer>Ver catálogo</button>
    </div>`;
}

function renderCartStep() {
  drawerTitle.textContent = 'Sacola';
  const t = totals();
  if (!t.items) {
    drawerBody.innerHTML = emptyState('Sua sacola está vazia', 'Adicione peças do catálogo para vê-las aqui.');
    drawerFoot.innerHTML = '';
    return;
  }
  drawerBody.innerHTML = [...state.cart].map(([id, q]) => {
    const p = byId(id);
    return `
      <div class="line">
        ${thumb(p)}
        <div class="line-info">
          <span class="line-name">${p.name}</span>
          <span class="line-price">${brl(p.price)}</span>
          <div class="stepper" aria-label="Quantidade de ${p.name}">
            <button type="button" data-dec="${id}" aria-label="Diminuir">−</button>
            <span>${q}</span>
            <button type="button" data-inc="${id}" aria-label="Aumentar">+</button>
          </div>
        </div>
        <button type="button" class="line-remove" data-remove="${id}">Remover</button>
      </div>`;
  }).join('');
  const falta = FRETE_GRATIS - t.sub;
  const pct = Math.min(100, Math.round(t.sub / FRETE_GRATIS * 100));
  drawerFoot.innerHTML = `
    <div class="ship">
      <span>${falta > 0 ? `Faltam <strong>${brl(falta)}</strong> para o frete grátis` : '<strong>Você ganhou frete grátis!</strong>'}</span>
      <div class="ship-track"><div class="ship-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="totals">
      <div><span>Subtotal (${t.items} ${t.items === 1 ? 'item' : 'itens'})</span><span>${brl(t.sub)}</span></div>
      <div><span>Frete</span><span>${t.frete ? brl(t.frete) : 'Grátis'}</span></div>
      <div class="total-row"><span>Total</span><span>${brl(t.total)}</span></div>
    </div>
    <button type="button" class="btn btn-solid btn-block" data-step="checkout">Finalizar compra</button>`;
}

function renderCheckoutStep() {
  drawerTitle.textContent = 'Finalizar compra';
  const t = totals();
  drawerBody.innerHTML = `
    <form id="checkout-form" class="checkout" novalidate>
      <label class="field">Nome completo
        <input name="nome" required autocomplete="name" placeholder="Seu nome">
      </label>
      <label class="field">E-mail
        <input name="email" type="email" required autocomplete="email" placeholder="seu@email.com">
      </label>
      <span class="form-section">Endereço de entrega</span>
      <label class="field">CEP
        <input name="cep" id="cep" required inputmode="numeric" pattern="\\d{5}-?\\d{3}" placeholder="00000-000" maxlength="9" autocomplete="postal-code">
        <span class="field-hint" id="cep-hint">Digite o CEP para preencher o endereço.</span>
      </label>
      <label class="field">Rua / avenida
        <input name="rua" required autocomplete="address-line1" placeholder="Nome da rua">
      </label>
      <div class="field-row">
        <label class="field">Número
          <input name="numero" required inputmode="numeric" placeholder="123">
        </label>
        <label class="field">Complemento
          <input name="complemento" autocomplete="address-line2" placeholder="Apto, bloco (opcional)">
        </label>
      </div>
      <label class="field">Bairro
        <input name="bairro" required placeholder="Bairro">
      </label>
      <div class="field-row field-row-uf">
        <label class="field">Cidade
          <input name="cidade" required autocomplete="address-level2" placeholder="Cidade">
        </label>
        <label class="field">UF
          <input name="uf" required maxlength="2" pattern="[A-Za-z]{2}" autocomplete="address-level1" placeholder="SP">
        </label>
      </div>
      <fieldset class="pay">
        <legend>Forma de pagamento</legend>
        ${Object.entries(PAGAMENTOS).map(([v, label], i) => `
          <label class="pay-option"><input type="radio" name="pagamento" value="${v}"${i === 0 ? ' checked' : ''}> ${label}</label>`).join('')}
      </fieldset>
      <p class="form-error" id="form-error" hidden>Preencha os campos destacados corretamente.</p>
    </form>`;
  drawerFoot.innerHTML = `
    <div class="totals">
      <div><span>Subtotal</span><span>${brl(t.sub)}</span></div>
      <div><span>Frete</span><span>${t.frete ? brl(t.frete) : 'Grátis'}</span></div>
      <div class="total-row"><span>Total</span><span>${brl(t.total)}</span></div>
    </div>
    <button type="submit" form="checkout-form" class="btn btn-solid btn-block">Confirmar pedido</button>
    <button type="button" class="btn-link" data-step="cart">Voltar para a sacola</button>`;
}

function renderDoneStep() {
  drawerTitle.textContent = 'Pedido confirmado';
  const o = state.order;
  drawerBody.innerHTML = `
    <div class="done">
      <span class="done-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
      <strong class="done-title">Obrigada, ${o.nome.split(' ')[0]}!</strong>
      <span class="muted">Seu pedido <strong class="order-num">${o.num}</strong> foi recebido. Enviamos os detalhes para ${o.email}.</span>
    </div>
    <div class="order-address">
      <span class="form-section">Entrega em</span>
      <span>${o.rua}, ${o.numero}${o.complemento ? ' — ' + o.complemento : ''}</span>
      <span>${o.bairro} · ${o.cidade}/${o.uf.toUpperCase()} · CEP ${o.cep}</span>
    </div>
    <div class="order-items">
      ${o.items.map((it) => `<div><span>${it.qty}× ${it.name}</span><span>${brl(it.price * it.qty)}</span></div>`).join('')}
    </div>
    <div class="totals">
      <div><span>Frete</span><span>${o.frete ? brl(o.frete) : 'Grátis'}</span></div>
      <div><span>Pagamento</span><span>${PAGAMENTOS[o.pagamento]}</span></div>
      <div class="total-row"><span>Total</span><span>${brl(o.total)}</span></div>
    </div>`;
  drawerFoot.innerHTML = '<button type="button" class="btn btn-solid btn-block" data-close-drawer>Continuar comprando</button>';
}

function renderFavs() {
  drawerTitle.textContent = 'Favoritos';
  drawerFoot.innerHTML = '';
  if (!state.favs.size) {
    drawerBody.innerHTML = emptyState('Nenhum favorito ainda', 'Toque no coração de uma peça para guardá-la aqui.');
    return;
  }
  drawerBody.innerHTML = [...state.favs].map((id) => {
    const p = byId(id);
    const added = state.cart.has(id);
    return `
      <div class="line">
        ${thumb(p)}
        <div class="line-info">
          <span class="line-name">${p.name}</span>
          <span class="line-price">${brl(p.price)}</span>
          <button type="button" class="add-btn add-btn-sm${added ? ' added' : ''}" data-add="${id}">${added ? 'Na sacola ✓' : 'Adicionar à sacola'}</button>
        </div>
        <button type="button" class="line-remove" data-fav="${id}">Remover</button>
      </div>`;
  }).join('');
}

function renderDrawer() {
  if (state.drawer === 'favs') renderFavs();
  else if (state.step === 'checkout') renderCheckoutStep();
  else if (state.step === 'done') renderDoneStep();
  else renderCartStep();
}

function openDrawer(mode) {
  closeModal();
  state.drawer = mode;
  if (mode === 'cart' && state.step === 'done') state.step = 'cart';
  renderDrawer();
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.classList.add('show');
  document.body.classList.add('no-scroll');
  $('#drawer-close').focus({ preventScroll: true });
}

function closeDrawer() {
  if (!state.drawer) return;
  state.drawer = null;
  if (state.step !== 'checkout') state.step = 'cart';
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('show');
  document.body.classList.remove('no-scroll');
}

function placeOrder(data) {
  const t = totals();
  state.order = {
    ...data,
    num: '#AM-' + String(Date.now()).slice(-6),
    items: [...state.cart].map(([id, qty]) => ({ name: byId(id).name, price: byId(id).price, qty })),
    frete: t.frete, total: t.total
  };
  state.cart.clear();
  state.step = 'done';
}

/* ---------- Geral ---------- */

function render() {
  renderFilters();
  renderProducts();
  const t = totals();
  cartCount.textContent = t.items;
  favCount.textContent = state.favs.size;
  favCount.hidden = state.favs.size === 0;
  if (state.drawer) renderDrawer();
  if (modal.open) renderModal();
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove('show'), 2200);
}

function toggleCart(id) {
  const p = byId(id);
  if (state.cart.has(id)) {
    state.cart.delete(id);
    showToast(`${p.name} removido da sacola`);
    return false;
  }
  state.cart.set(id, 1);
  state.step = 'cart';
  cartCount.classList.add('bump');
  setTimeout(() => cartCount.classList.remove('bump'), 200);
  return true;
}

// Delegação de cliques
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-filter],[data-sort],[data-add],[data-fav],[data-open],[data-drawer],[data-close-drawer],[data-close-modal],[data-step],[data-inc],[data-dec],[data-remove]');
  if (!el) return;
  const d = el.dataset;

  if (d.filter) {
    state.filter = d.filter;
    closeMenu();
    render();
    if (el.matches('.cat-tile')) $('#catalogo').scrollIntoView();
  } else if (d.sort) {
    state.sort = sortSelect.value = d.sort;
    render();
  } else if (d.add) {
    const added = toggleCart(Number(d.add));
    render();
    // Ao adicionar, a sacola abre direto, já com o botão de finalizar compra
    if (added) openDrawer('cart');
  } else if (d.fav) {
    const id = Number(d.fav);
    state.favs.has(id) ? state.favs.delete(id) : state.favs.add(id);
    render();
  } else if (d.open) {
    openModal(Number(d.open));
  } else if (d.drawer) {
    e.preventDefault();
    closeMenu();
    openDrawer(d.drawer);
  } else if ('closeDrawer' in d) {
    closeDrawer();
  } else if ('closeModal' in d) {
    closeModal();
  } else if (d.step) {
    state.step = d.step;
    renderDrawer();
  } else if (d.inc || d.dec || d.remove) {
    const id = Number(d.inc || d.dec || d.remove);
    const q = (state.cart.get(id) || 0) + (d.inc ? 1 : d.dec ? -1 : -Infinity);
    q > 0 ? state.cart.set(id, q) : state.cart.delete(id);
    render();
  }
});

overlay.addEventListener('click', closeDrawer);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

// Checkout: validação e confirmação
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'checkout-form') return;
  e.preventDefault();
  const form = e.target;
  const error = $('#form-error');
  form.classList.add('validated');
  if (!form.checkValidity()) {
    error.hidden = false;
    form.querySelector(':invalid').focus();
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  placeOrder(data);
  render();
});

// CEP: máscara 00000-000 e preenchimento automático do endereço (ViaCEP)
document.addEventListener('input', (e) => {
  if (e.target.id !== 'cep') return;
  const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
  e.target.value = digits.length > 5 ? digits.slice(0, 5) + '-' + digits.slice(5) : digits;
  if (digits.length === 8) buscarCep(digits);
});

async function buscarCep(cep) {
  const hint = $('#cep-hint');
  const form = $('#checkout-form');
  hint.textContent = 'Buscando endereço…';
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (data.erro) throw new Error('CEP não encontrado');
    form.rua.value = data.logradouro || '';
    form.bairro.value = data.bairro || '';
    form.cidade.value = data.localidade || '';
    form.uf.value = data.uf || '';
    hint.textContent = 'Endereço encontrado. Confira e informe o número.';
    (data.logradouro ? form.numero : form.rua).focus();
  } catch {
    hint.textContent = 'Não encontramos esse CEP. Preencha o endereço manualmente.';
  }
}

sortSelect.addEventListener('change', () => {
  state.sort = sortSelect.value;
  renderProducts();
});

// As duas buscas (desktop e mobile) ficam sincronizadas
const searchInputs = document.querySelectorAll('.search-input');
function setQuery(value) {
  state.query = value;
  searchInputs.forEach((input) => { if (input.value !== value) input.value = value; });
  renderProducts();
}
searchInputs.forEach((input) => {
  input.addEventListener('input', () => setQuery(input.value));
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

$('.account-btn').addEventListener('click', () => showToast('Área do cliente em breve'));

$('#newsletter-form').addEventListener('submit', (e) => {
  e.preventDefault();
  e.target.reset();
  showToast('Pronto! Você vai receber nossas novidades.');
});

// Re-renderiza ao cruzar o breakpoint (rótulo do botão e traço dos ícones mudam)
window.matchMedia('(max-width: 900px)').addEventListener('change', renderProducts);

render();

function scrollToCatalog() {
  // O print headless sai em branco quando a página rola: nele, as seções acima do catálogo ficam ocultas
  if (/HeadlessChrome|HeadlessEdg/.test(navigator.userAgent)) {
    document.body.classList.add('so-catalogo');
    return;
  }
  document.documentElement.style.scrollBehavior = 'auto';
  $('#catalogo').scrollIntoView();
  document.documentElement.style.scrollBehavior = '';
}

// ?tela=... abre uma tela específica (usado pelos links da documentação)
const DEMOS = {
  catalogo() { state.filter = 'Colares'; render(); scrollToCatalog(); },
  busca() { setQuery('brinco'); scrollToCatalog(); },
  produto() { openModal(1); },
  favoritos() { [1, 3, 7].forEach((id) => state.favs.add(id)); render(); openDrawer('favs'); },
  sacola() { state.cart.set(1, 1).set(4, 2); render(); openDrawer('cart'); },
  checkout() {
    state.cart.set(1, 1).set(4, 2);
    state.step = 'checkout';
    render();
    openDrawer('cart');
    const f = $('#checkout-form');
    [['nome', 'Ana Souza'], ['email', 'ana@email.com'], ['cep', '01310-100'], ['rua', 'Avenida Paulista'], ['numero', '1000'], ['complemento', 'Apto 52'], ['bairro', 'Bela Vista'], ['cidade', 'São Paulo'], ['uf', 'SP']]
      .forEach(([k, v]) => { f.elements[k].value = v; });
    $('#cep-hint').textContent = 'Endereço encontrado. Confira e informe o número.';
  },
  confirmacao() {
    state.cart.set(1, 1).set(4, 2);
    placeOrder({ nome: 'Ana Souza', email: 'ana@email.com', pagamento: 'pix', cep: '01310-100', rua: 'Avenida Paulista', numero: '1000', complemento: 'Apto 52', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' });
    state.order.num = '#AM-482913';
    render();
    state.drawer = 'cart';
    renderDrawer();
    drawer.classList.add('open');
    overlay.classList.add('show');
  }
};
const demo = DEMOS[new URLSearchParams(location.search).get('tela')];
if (demo) {
  demo();
  document.activeElement?.blur();
}
