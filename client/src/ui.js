import { formatCurrency, truncate } from './utils.js';

// ─── Sidebar Navigation ─────────────────────────────────────────────────────

/**
 * Sets the active navigation item in the sidebar.
 * @param {string} activeId - The ID of the nav item to mark as active.
 */
export function setActiveNav(activeId) {
  document.querySelectorAll('.nav__item').forEach((item) => {
    item.classList.toggle('nav__item--active', item.dataset.view === activeId);
  });
}

// ─── Main Content Area ──────────────────────────────────────────────────────

/**
 * Renders a loading spinner inside the main content area.
 */
export function renderLoading() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Carregando...</p>
    </div>
  `;
}

/**
 * Renders an error message inside the main content area.
 * @param {string} message
 */
export function renderError(message) {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="empty-state">
      <span class="empty-state__icon">⚠️</span>
      <p>${message}</p>
    </div>
  `;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

/**
 * Renders the dashboard view.
 * @param {{ apiOnline: boolean }} data
 */
export function renderDashboard({ apiOnline }) {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Bem-vindo ao Sistema da Padaria 🍞</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-card__icon">🟢</span>
        <div class="stat-card__info">
          <span class="stat-card__label">Status da API</span>
          <span class="stat-card__value ${apiOnline ? 'text--success' : 'text--error'}">
            ${apiOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  `;
}

// ─── Produtos ───────────────────────────────────────────────────────────────

/**
 * Renders the product list view.
 * @param {Array} produtos
 * @param {{ onEdit: Function, onDelete: Function, onCreate: Function }} callbacks
 */
export function renderProdutos(produtos, { onEdit, onDelete, onCreate }) {
  const main = document.getElementById('main-content');

  const rows = produtos.map(
    (p) => `
    <tr class="table__row" data-id="${p.id}">
      <td class="table__cell">${p.id}</td>
      <td class="table__cell">${p.codigo}</td>
      <td class="table__cell">${truncate(p.nomeProduto, 30)}</td>
      <td class="table__cell">${formatCurrency(p.preco)}</td>
      <td class="table__cell">${p.estoque}</td>
      <td class="table__cell table__cell--actions">
        <button class="btn btn--sm btn--secondary" data-action="edit" data-id="${p.id}">Editar</button>
        <button class="btn btn--sm btn--danger" data-action="delete" data-id="${p.id}">Excluir</button>
      </td>
    </tr>
  `
  ).join('');

  const emptyState = `
    <div class="empty-state">
      <span class="empty-state__icon">📦</span>
      <p>Nenhum produto cadastrado ainda.</p>
    </div>
  `;

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Produtos</h1>
        <p class="page-subtitle">Gerencie o catálogo de produtos</p>
      </div>
      <button class="btn btn--primary" id="btn-create-produto">+ Novo Produto</button>
    </div>

    ${
      produtos.length === 0
        ? emptyState
        : `
      <div class="table-wrapper">
        <table class="table">
          <thead class="table__head">
            <tr>
              <th class="table__header">ID</th>
              <th class="table__header">Código</th>
              <th class="table__header">Nome</th>
              <th class="table__header">Preço</th>
              <th class="table__header">Estoque</th>
              <th class="table__header">Ações</th>
            </tr>
          </thead>
          <tbody id="produtos-tbody">${rows}</tbody>
        </table>
      </div>
    `
    }
  `;

  document.getElementById('btn-create-produto')?.addEventListener('click', onCreate);

  document.getElementById('produtos-tbody')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'edit') onEdit(id);
    if (btn.dataset.action === 'delete') onDelete(id);
  });
}

// ─── Modal ──────────────────────────────────────────────────────────────────

/**
 * Opens a generic modal with a title and HTML content.
 * @param {string} title
 * @param {string} bodyHtml
 */
export function openModal(title, bodyHtml) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-overlay').classList.add('modal--open');
}

/**
 * Closes the open modal.
 */
export function closeModal() {
  document.getElementById('modal-overlay').classList.remove('modal--open');
}

/**
 * Renders the product form inside a modal.
 * @param {object|null} produto - Existing product data for editing, or null for creation.
 * @param {Function} onSubmit - Called with the form data object on submission.
 */
export function renderProdutoForm(produto, onSubmit) {
  const isEditing = !!produto;
  const formHtml = `
    <form id="produto-form" class="form">
      <div class="form__group">
        <label class="form__label" for="f-nome">Nome do Produto</label>
        <input class="form__input" id="f-nome" name="nomeProduto" type="text"
          placeholder="Ex: Pão Francês" value="${isEditing ? produto.nomeProduto : ''}" required />
      </div>
      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-codigo">Código</label>
          <input class="form__input" id="f-codigo" name="codigo" type="text"
            placeholder="Ex: PAO001" value="${isEditing ? produto.codigo : ''}" required />
        </div>
        <div class="form__group">
          <label class="form__label" for="f-categoria">ID Categoria</label>
          <input class="form__input" id="f-categoria" name="categoriaId" type="number"
            placeholder="Ex: 1" value="${isEditing ? produto.categoriaId : ''}" required />
        </div>
      </div>
      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-preco">Preço (R$)</label>
          <input class="form__input" id="f-preco" name="preco" type="number" step="0.01"
            placeholder="Ex: 0.50" value="${isEditing ? produto.preco : ''}" required />
        </div>
        <div class="form__group">
          <label class="form__label" for="f-estoque">Estoque</label>
          <input class="form__input" id="f-estoque" name="estoque" type="text"
            placeholder="Ex: 100" value="${isEditing ? produto.estoque : ''}" required />
        </div>
      </div>
      <div class="form__actions">
        <button type="button" class="btn btn--secondary" id="btn-cancel-modal">Cancelar</button>
        <button type="submit" class="btn btn--primary">${isEditing ? 'Salvar Alterações' : 'Criar Produto'}</button>
      </div>
    </form>
  `;

  openModal(isEditing ? 'Editar Produto' : 'Novo Produto', formHtml);

  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
  document.getElementById('produto-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    data.preco = parseFloat(data.preco);
    data.categoriaId = parseInt(data.categoriaId);
    onSubmit(data);
  });
}
