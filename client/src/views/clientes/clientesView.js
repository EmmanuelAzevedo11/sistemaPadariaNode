import { ClientesAPI } from '../../api/index.js';
import { openModal, closeModal } from '../shared/modal.js';
import { renderError } from '../shared/layout.js';
import { truncate, showToast } from '../../utils.js';

// ─── Render ─────────────────────────────────────────────────────────────────

/**
 * Renders the clientes list view.
 * @param {Array} clientes
 * @param {{ onEdit: Function, onDelete: Function, onCreate: Function }} callbacks
 */
function renderClientes(clientes, { onEdit, onDelete, onCreate }) {
  const main = document.getElementById('main-content');

  const rows = clientes.map(
    (c) => `
    <tr class="table__row" data-id="${c.id}">
      <td class="table__cell">${c.id}</td>
      <td class="table__cell">${truncate(c.nomeCliente, 30)}</td>
      <td class="table__cell">${c.cpf ?? '—'}</td>
      <td class="table__cell">${c.email ?? '—'}</td>
      <td class="table__cell">${c.telefone ?? '—'}</td>
      <td class="table__cell table__cell--actions">
        <button class="btn btn--sm btn--secondary" data-action="edit" data-id="${c.id}">Editar</button>
        <button class="btn btn--sm btn--danger" data-action="delete" data-id="${c.id}">Excluir</button>
      </td>
    </tr>
  `
  ).join('');

  const emptyState = `
    <div class="empty-state">
      <span class="empty-state__icon">👥</span>
      <p>Nenhum cliente cadastrado ainda.</p>
    </div>
  `;

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Clientes</h1>
        <p class="page-subtitle">Gerencie os clientes cadastrados</p>
      </div>
      <button class="btn btn--primary" id="btn-create-cliente">+ Novo Cliente</button>
    </div>

    ${clientes.length === 0
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
          <tbody id="clientes-tbody">${rows}</tbody>
        </table>
      </div>
    `
    }
  `;

  document.getElementById('btn-create-cliente')?.addEventListener('click', onCreate);

  document.getElementById('clientes-tbody')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'edit') onEdit(id);
    if (btn.dataset.action === 'delete') onDelete(id);
  });
}

// ─── Form ───────────────────────────────────────────────────────────────────

function renderClienteForm(cliente, onSubmit) {
  const isEditing = !!cliente;
  const formHtml = `
    <form id="cliente-form" class="form">
      <div class="form__group">
        <label class="form__label" for="f-nome-cli">Nome do Cliente</label>
        <input class="form__input" id="f-nome-cli" name="nomeCliente" type="text"
          placeholder="Ex: Maria Souza" value="${isEditing ? cliente.nomeCliente : ''}" required />
      </div>
      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-cpf-cli">CPF</label>
          <input class="form__input" id="f-cpf-cli" name="cpf" type="text"
            placeholder="Ex: 000.000.000-00" value="${isEditing ? cliente.cpf ?? '' : ''}" required />
        </div>
        <div class="form__group">
          <label class="form__label" for="f-email-cli">E-mail</label>
          <input class="form__input" id="f-email-cli" name="email" type="email"
            placeholder="Ex: maria@email.com" value="${isEditing ? cliente.email ?? '' : ''}" required />
        </div>
      </div>
      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-telefone-cli">Telefone</label>
          <input class="form__input" id="f-telefone-cli" name="telefone" type="text"
            placeholder="Ex: (11) 99999-0000" value="${isEditing ? cliente.telefone ?? '' : ''}" required />
        </div>
        <div class="form__group">
          <label class="form__label" for="f-data-cad-cli">Data Cadastro</label>
          <input class="form__input" id="f-data-cad-cli" name="dataCadastro" type="datetime-local"
            value="${isEditing && cliente.dataCadastro ? cliente.dataCadastro.slice(0, 16) : ''}" required />
        </div>
      </div>
      <div class="form__actions">
        <button type="button" class="btn btn--secondary" id="btn-cancel-modal">Cancelar</button>
        <button type="submit" class="btn btn--primary">${isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}</button>
      </div>
    </form>
  `;

  openModal(isEditing ? 'Editar Cliente' : 'Novo Cliente', formHtml);

  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
  document.getElementById('cliente-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    onSubmit(data);
  });
}

// ─── Actions ────────────────────────────────────────────────────────────────

function openCreateCliente() {
  renderClienteForm(null, async (formData) => {
    try {
      await ClientesAPI.create(formData);
      closeModal();
      showToast('Cliente cadastrado com sucesso!');
      await loadClientes();
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });
}

function openEditCliente(id, clientes) {
  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) return;

  renderClienteForm(cliente, async (formData) => {
    try {
      await ClientesAPI.update(id, formData);
      closeModal();
      showToast('Cliente atualizado com sucesso!');
      await loadClientes();
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });
}

async function deleteCliente(id) {
  if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
  try {
    await ClientesAPI.delete(id);
    showToast('Cliente excluído com sucesso!');
    await loadClientes();
  } catch (err) {
    showToast(`Erro: ${err.message}`, 'error');
  }
}

// ─── Loader ─────────────────────────────────────────────────────────────────

/**
 * Loads and renders the Clientes view.
 */
export async function loadClientes() {
  try {
    const data = await ClientesAPI.getAll();
    const clientes = data.listaClientes ?? [];
    renderClientes(clientes, {
      onCreate: () => openCreateCliente(),
      onEdit: (id) => openEditCliente(id, clientes),
      onDelete: (id) => deleteCliente(id),
    });
  } catch (err) {
    renderError(`Erro ao carregar clientes: ${err.message}`);
  }
}
