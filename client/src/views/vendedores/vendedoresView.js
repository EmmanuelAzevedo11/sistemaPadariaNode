import { VendedorAPI } from '../../api/index.js';
import { openModal, closeModal } from '../shared/modal.js';
import { renderError } from '../shared/layout.js';
import { truncate, showToast } from '../../utils.js';

// ─── Render ─────────────────────────────────────────────────────────────────

/**
 * Renders the vendedores list view.
 * @param {Array} vendedores
 * @param {{ onEdit: Function, onCreate: Function }} callbacks
 */
function renderVendedores(vendedores, { onEdit, onCreate }) {
  const main = document.getElementById('main-content');

  const rows = vendedores.map(
    (v) => `
    <tr class="table__row" data-id="${v.id}">
      <td class="table__cell">${v.id}</td>
      <td class="table__cell">${truncate(v.nome, 30)}</td>
      <td class="table__cell">${v.cpf ?? '—'}</td>
      <td class="table__cell">${v.email ?? '—'}</td>
      <td class="table__cell">${v.telefone ?? '—'}</td>
      <td class="table__cell table__cell--actions">
        <button class="btn btn--sm btn--secondary" data-action="edit" data-id="${v.id}">Editar</button>
      </td>
    </tr>
  `
  ).join('');

  const emptyState = `
    <div class="empty-state">
      <span class="empty-state__icon">🧑‍💼</span>
      <p>Nenhum vendedor cadastrado ainda.</p>
    </div>
  `;

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Vendedores</h1>
        <p class="page-subtitle">Gerencie a equipe de vendas</p>
      </div>
      <button class="btn btn--primary" id="btn-create-vendedor">+ Novo Vendedor</button>
    </div>

    ${
      vendedores.length === 0
        ? emptyState
        : `
      <div class="table-wrapper">
        <table class="table">
          <thead class="table__head">
            <tr>
              <th class="table__header">ID</th>
              <th class="table__header">Nome</th>
              <th class="table__header">CPF</th>
              <th class="table__header">E-mail</th>
              <th class="table__header">Telefone</th>
              <th class="table__header">Ações</th>
            </tr>
          </thead>
          <tbody id="vendedores-tbody">${rows}</tbody>
        </table>
      </div>
    `
    }
  `;

  document.getElementById('btn-create-vendedor')?.addEventListener('click', onCreate);

  document.getElementById('vendedores-tbody')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'edit') onEdit(id);
  });
}

// ─── Form ───────────────────────────────────────────────────────────────────

function renderVendedorForm(vendedor, onSubmit) {
  const isEditing = !!vendedor;
  const formHtml = `
    <form id="vendedor-form" class="form">
      <div class="form__group">
        <label class="form__label" for="f-nome-vend">Nome</label>
        <input class="form__input" id="f-nome-vend" name="nome" type="text"
          placeholder="Ex: João Silva" value="${isEditing ? vendedor.nome : ''}" required />
      </div>
      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-cpf-vend">CPF</label>
          <input class="form__input" id="f-cpf-vend" name="cpf" type="text"
            placeholder="Ex: 000.000.000-00" value="${isEditing ? vendedor.cpf ?? '' : ''}" required />
        </div>
        <div class="form__group">
          <label class="form__label" for="f-email-vend">E-mail</label>
          <input class="form__input" id="f-email-vend" name="email" type="email"
            placeholder="Ex: joao@padaria.com" value="${isEditing ? vendedor.email ?? '' : ''}" required />
        </div>
      </div>
      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-telefone-vend">Telefone</label>
          <input class="form__input" id="f-telefone-vend" name="telefone" type="text"
            placeholder="Ex: (11) 99999-0000" value="${isEditing ? vendedor.telefone ?? '' : ''}" required />
        </div>
        <div class="form__group">
          <label class="form__label" for="f-data-cad-vend">Data Cadastro</label>
          <input class="form__input" id="f-data-cad-vend" name="dataCadastro" type="datetime-local"
            value="${isEditing && vendedor.dataCadastro ? vendedor.dataCadastro.slice(0, 16) : ''}" required />
        </div>
      </div>
      ${!isEditing ? `
      <div class="form__group">
        <label class="form__label" for="f-senha-vend">Senha</label>
        <input class="form__input" id="f-senha-vend" name="senhaHash" type="password"
          placeholder="Senha do vendedor" required />
      </div>
      ` : ''}
      <div class="form__actions">
        <button type="button" class="btn btn--secondary" id="btn-cancel-modal">Cancelar</button>
        <button type="submit" class="btn btn--primary">${isEditing ? 'Salvar Alterações' : 'Criar Vendedor'}</button>
      </div>
    </form>
  `;

  openModal(isEditing ? 'Editar Vendedor' : 'Novo Vendedor', formHtml);

  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
  document.getElementById('vendedor-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    onSubmit(data);
  });
}

// ─── Actions ────────────────────────────────────────────────────────────────

function openCreateVendedor() {
  renderVendedorForm(null, async (formData) => {
    try {
      await VendedorAPI.create(formData);
      closeModal();
      showToast('Vendedor criado com sucesso!');
      await loadVendedores();
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });
}

function openEditVendedor(id, vendedores) {
  const vendedor = vendedores.find((v) => v.id === id);
  if (!vendedor) return;

  renderVendedorForm(vendedor, async (formData) => {
    try {
      await VendedorAPI.update(id, formData);
      closeModal();
      showToast('Vendedor atualizado com sucesso!');
      await loadVendedores();
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });
}

// ─── Loader ─────────────────────────────────────────────────────────────────

/**
 * Loads and renders the Vendedores view.
 */
export async function loadVendedores() {
  try {
    const data = await VendedorAPI.getAll();
    const vendedores = data.vendedores ?? [];
    renderVendedores(vendedores, {
      onCreate: () => openCreateVendedor(),
      onEdit: (id) => openEditVendedor(id, vendedores),
    });
  } catch (err) {
    renderError(`Erro ao carregar vendedores: ${err.message}`);
  }
}
