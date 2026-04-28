import { CategoriasAPI } from '../../api/index.js';
import { openModal, closeModal } from '../shared/modal.js';
import { renderError } from '../shared/layout.js';
import { truncate, showToast } from '../../utils.js';

// ─── Render ─────────────────────────────────────────────────────────────────

/**
 * Renders the categorias list view.
 * @param {Array} categorias
 * @param {{ onEdit: Function, onDelete: Function, onCreate: Function }} callbacks
 */
function renderCategorias(categorias, { onEdit, onDelete, onCreate }) {
  const main = document.getElementById('main-content');

  const rows = categorias.map(
    (c) => `
    <tr class="table__row" data-id="${c.id}">
      <td class="table__cell">${c.id}</td>
      <td class="table__cell">${truncate(c.nomeCategoria, 30)}</td>
      <td class="table__cell">${truncate(c.descricao, 50)}</td>
      <td class="table__cell table__cell--actions">
        <button class="btn btn--sm btn--secondary" data-action="edit" data-id="${c.id}">Editar</button>
        <button class="btn btn--sm btn--danger" data-action="delete" data-id="${c.id}">Excluir</button>
      </td>
    </tr>
  `
  ).join('');

  const emptyState = `
    <div class="empty-state">
      <span class="empty-state__icon">🏷️</span>
      <p>Nenhuma categoria cadastrada ainda.</p>
    </div>
  `;

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Categorias</h1>
        <p class="page-subtitle">Gerencie as categorias de produtos</p>
      </div>
      <button class="btn btn--primary" id="btn-create-categoria">+ Nova Categoria</button>
    </div>

    ${
      categorias.length === 0
        ? emptyState
        : `
      <div class="table-wrapper">
        <table class="table">
          <thead class="table__head">
            <tr>
              <th class="table__header">ID</th>
              <th class="table__header">Nome</th>
              <th class="table__header">Descrição</th>
              <th class="table__header">Ações</th>
            </tr>
          </thead>
          <tbody id="categorias-tbody">${rows}</tbody>
        </table>
      </div>
    `
    }
  `;

  document.getElementById('btn-create-categoria')?.addEventListener('click', onCreate);

  document.getElementById('categorias-tbody')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'edit') onEdit(id);
    if (btn.dataset.action === 'delete') onDelete(id);
  });
}

// ─── Form ───────────────────────────────────────────────────────────────────

function renderCategoriaForm(categoria, onSubmit) {
  const isEditing = !!categoria;
  const formHtml = `
    <form id="categoria-form" class="form">
      <div class="form__group">
        <label class="form__label" for="f-nome-cat">Nome da Categoria</label>
        <input class="form__input" id="f-nome-cat" name="nomeCategoria" type="text"
          placeholder="Ex: Pães" value="${isEditing ? categoria.nomeCategoria : ''}" required />
      </div>
      <div class="form__group">
        <label class="form__label" for="f-descricao">Descrição</label>
        <input class="form__input" id="f-descricao" name="descricao" type="text"
          placeholder="Ex: Todos os tipos de pães" value="${isEditing ? categoria.descricao : ''}" required />
      </div>
      <div class="form__actions">
        <button type="button" class="btn btn--secondary" id="btn-cancel-modal">Cancelar</button>
        <button type="submit" class="btn btn--primary">${isEditing ? 'Salvar Alterações' : 'Criar Categoria'}</button>
      </div>
    </form>
  `;

  openModal(isEditing ? 'Editar Categoria' : 'Nova Categoria', formHtml);

  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
  document.getElementById('categoria-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    onSubmit(data);
  });
}

// ─── Actions ────────────────────────────────────────────────────────────────

function openCreateCategoria() {
  renderCategoriaForm(null, async (formData) => {
    try {
      await CategoriasAPI.create(formData);
      closeModal();
      showToast('Categoria criada com sucesso!');
      await loadCategorias();
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });
}

function openEditCategoria(id, categorias) {
  const categoria = categorias.find((c) => c.id === id);
  if (!categoria) return;

  renderCategoriaForm(categoria, async (formData) => {
    try {
      await CategoriasAPI.update(id, formData);
      closeModal();
      showToast('Categoria atualizada com sucesso!');
      await loadCategorias();
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });
}

async function deleteCategoria(id) {
  if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
  try {
    await CategoriasAPI.delete(id);
    showToast('Categoria excluída com sucesso!');
    await loadCategorias();
  } catch (err) {
    showToast(`Erro: ${err.message}`, 'error');
  }
}

// ─── Loader ─────────────────────────────────────────────────────────────────

/**
 * Loads and renders the Categorias view.
 */
export async function loadCategorias() {
  try {
    const data = await CategoriasAPI.getAll();
    const categorias = data.categorias ?? [];
    renderCategorias(categorias, {
      onCreate: () => openCreateCategoria(),
      onEdit: (id) => openEditCategoria(id, categorias),
      onDelete: (id) => deleteCategoria(id),
    });
  } catch (err) {
    renderError(`Erro ao carregar categorias: ${err.message}`);
  }
}
