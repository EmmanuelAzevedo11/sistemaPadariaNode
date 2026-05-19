import { ProdutosAPI, CategoriasAPI } from '../../api/index.js';
import { openModal, closeModal } from '../shared/modal.js';
import { renderError } from '../shared/layout.js';
import { formatCurrency, truncate, showToast } from '../../utils.js';

// ─── Render ─────────────────────────────────────────────────────────────────

/**
 * Renders the product list view.
 * @param {Array} produtos
 * @param {{ onEdit: Function, onDelete: Function, onCreate: Function }} callbacks
 */
function renderProdutos(produtos, { onEdit, onDelete, onCreate }) {
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

// ─── Form ───────────────────────────────────────────────────────────────────

/**
 * Renders the product form inside a modal.
 * @param {object|null} produto - Existing product data for editing, or null for creation.
 * @param {Function} onSubmit - Called with the form data object on submission.
 */
function renderProdutoForm(produto, categorias, onSubmit) {
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
          <label class="form__label" for="f-categoria">Categoria</label>
          <select class="form__input" id="f-categoria" name="categoriaId" required>
            <option value="" disabled ${!isEditing ? 'selected' : ''}>Selecione uma categoria...</option>
            ${categorias.map(cat => `
              <option value="${cat.id}" ${isEditing && produto.categoriaId === cat.id ? 'selected' : ''}>
                ${cat.nomeCategoria}
              </option>
            `).join('')}
          </select>
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

// ─── Actions ────────────────────────────────────────────────────────────────

async function openCreateProduto() {
  try {
    const res = await CategoriasAPI.getAll();
    const categorias = Array.isArray(res.categorias) ? res.categorias : [];

    renderProdutoForm(null, categorias, async (formData) => {
    try {
      await ProdutosAPI.create(formData);
      closeModal();
      showToast('Produto criado com sucesso!');
      await loadProdutos();
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });
  } catch (err) {
    showToast(`Erro ao carregar categorias: ${err.message}`, 'error');
  }
}

async function openEditProduto(id, produtos) {
  const produto = produtos.find((p) => p.id === id);
  if (!produto) return;

  try {
    const res = await CategoriasAPI.getAll();
    const categorias = Array.isArray(res.categorias) ? res.categorias : [];

    renderProdutoForm(produto, categorias, async (formData) => {
    try {
      await ProdutosAPI.update(id, formData);
      closeModal();
      showToast('Produto atualizado com sucesso!');
      await loadProdutos();
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });
  } catch(err) {
    showToast(`Erro ao carregar categorias: ${err.message}`, 'error');
  }
}

async function deleteProduto(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  try {
    await ProdutosAPI.delete(id);
    showToast('Produto excluído com sucesso!');
    await loadProdutos();
  } catch (err) {
    showToast(`Erro: ${err.message}`, 'error');
  }
}

// ─── Loader ─────────────────────────────────────────────────────────────────

/**
 * Loads and renders the Produtos view.
 */
export async function loadProdutos() {
  try {
    const data = await ProdutosAPI.getAll();
    const produtos = Array.isArray(data) ? data : [];
    renderProdutos(produtos, {
      onCreate: () => openCreateProduto(),
      onEdit: (id) => openEditProduto(id, produtos),
      onDelete: (id) => deleteProduto(id),
    });
  } catch (err) {
    renderError(`Erro ao carregar produtos: ${err.message}`);
  }
}
