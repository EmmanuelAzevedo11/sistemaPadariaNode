import { VendasAPI } from '../../api/index.js';
import { openModal, closeModal } from '../shared/modal.js';
import { renderError } from '../shared/layout.js';
import { formatCurrency, formatDate, showToast } from '../../utils.js';

// ─── Render ─────────────────────────────────────────────────────────────────

/**
 * Renders the vendas list view.
 * @param {Array} vendas
 * @param {{ onEdit: Function, onDelete: Function, onCreate: Function }} callbacks
 */
function renderVendas(vendas, { onEdit, onDelete, onCreate }) {
  const main = document.getElementById('main-content');

  const rows = vendas.map(
    (v) => `
    <tr class="table__row" data-id="${v.id}">
      <td class="table__cell">${v.id}</td>
      <td class="table__cell">${formatCurrency(v.valorTotalBruto)}</td>
      <td class="table__cell">${formatCurrency(v.valorTotalLiquido)}</td>
      <td class="table__cell">${v.descontoAplicado ?? 0}%</td>
      <td class="table__cell">${v.dataHoraVenda ? formatDate(v.dataHoraVenda) : '—'}</td>
      <td class="table__cell table__cell--actions">
        <button class="btn btn--sm btn--secondary" data-action="edit" data-id="${v.id}">Editar</button>
        <button class="btn btn--sm btn--danger" data-action="delete" data-id="${v.id}">Excluir</button>
      </td>
    </tr>
  `
  ).join('');

  const emptyState = `
    <div class="empty-state">
      <span class="empty-state__icon">🛒</span>
      <p>Nenhuma venda registrada ainda.</p>
    </div>
  `;

  main.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Vendas</h1>
        <p class="page-subtitle">Histórico de vendas realizadas</p>
      </div>
      <button class="btn btn--primary" id="btn-create-venda">+ Nova Venda</button>
    </div>

    ${
      vendas.length === 0
        ? emptyState
        : `
      <div class="table-wrapper">
        <table class="table">
          <thead class="table__head">
            <tr>
              <th class="table__header">ID</th>
              <th class="table__header">Total Bruto</th>
              <th class="table__header">Total Líquido</th>
              <th class="table__header">Desconto</th>
              <th class="table__header">Data</th>
              <th class="table__header">Ações</th>
            </tr>
          </thead>
          <tbody id="vendas-tbody">${rows}</tbody>
        </table>
      </div>
    `
    }
  `;

  document.getElementById('btn-create-venda')?.addEventListener('click', onCreate);

  document.getElementById('vendas-tbody')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'edit') onEdit(id);
    if (btn.dataset.action === 'delete') onDelete(id);
  });
}

// ─── Form ───────────────────────────────────────────────────────────────────

function renderVendaForm(venda, onSubmit) {
  const isEditing = !!venda;
  const formHtml = `
    <form id="venda-form" class="form">
      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-bruto">Total Bruto (R$)</label>
          <input class="form__input" id="f-bruto" name="valorTotalBruto" type="number" step="0.01"
            placeholder="Ex: 150.00" value="${isEditing ? venda.valorTotalBruto : ''}" required />
        </div>
        <div class="form__group">
          <label class="form__label" for="f-liquido">Total Líquido (R$)</label>
          <input class="form__input" id="f-liquido" name="valorTotalLiquido" type="number" step="0.01"
            placeholder="Ex: 135.00" value="${isEditing ? venda.valorTotalLiquido : ''}" required />
        </div>
      </div>
      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-desconto">Desconto (%)</label>
          <input class="form__input" id="f-desconto" name="descontoAplicado" type="number" step="0.01"
            placeholder="Ex: 10" value="${isEditing ? venda.descontoAplicado ?? 0 : '0'}" />
        </div>
        <div class="form__group">
          <label class="form__label" for="f-data-venda">Data da Venda</label>
          <input class="form__input" id="f-data-venda" name="dataHoraVenda" type="datetime-local"
            value="${isEditing && venda.dataHoraVenda ? venda.dataHoraVenda.slice(0, 16) : ''}" required />
        </div>
      </div>
      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-vendedor-id">ID Vendedor</label>
          <input class="form__input" id="f-vendedor-id" name="vendedorId" type="number"
            placeholder="Ex: 1" value="${isEditing ? venda.vendedorId : ''}" required />
        </div>
        <div class="form__group">
          <label class="form__label" for="f-cliente-id">ID Cliente</label>
          <input class="form__input" id="f-cliente-id" name="clienteId" type="number"
            placeholder="Ex: 1" value="${isEditing ? venda.clienteId : ''}" required />
        </div>
      </div>
      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-forma-pag">ID Forma Pagamento</label>
          <input class="form__input" id="f-forma-pag" name="formaPagamentoId" type="number"
            placeholder="Ex: 1" value="${isEditing ? venda.formaPagamentoId : ''}" required />
        </div>
        <div class="form__group">
          <label class="form__label" for="f-cpf-nf">CPF Nota Fiscal</label>
          <input class="form__input" id="f-cpf-nf" name="cpfNotaFiscal" type="text"
            placeholder="Ex: 000.000.000-00" value="${isEditing ? venda.cpfNotaFiscal ?? '' : ''}" />
        </div>
      </div>
      <div class="form__actions">
        <button type="button" class="btn btn--secondary" id="btn-cancel-modal">Cancelar</button>
        <button type="submit" class="btn btn--primary">${isEditing ? 'Salvar Alterações' : 'Registrar Venda'}</button>
      </div>
    </form>
  `;

  openModal(isEditing ? 'Editar Venda' : 'Nova Venda', formHtml);

  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
  document.getElementById('venda-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    data.valorTotalBruto = parseFloat(data.valorTotalBruto);
    data.valorTotalLiquido = parseFloat(data.valorTotalLiquido);
    data.descontoAplicado = parseFloat(data.descontoAplicado) || 0;
    data.vendedorId = parseInt(data.vendedorId);
    data.clienteId = parseInt(data.clienteId);
    data.formaPagamentoId = parseInt(data.formaPagamentoId);
    if (!data.cpfNotaFiscal) delete data.cpfNotaFiscal;
    onSubmit(data);
  });
}

// ─── Actions ────────────────────────────────────────────────────────────────

function openCreateVenda() {
  renderVendaForm(null, async (formData) => {
    try {
      await VendasAPI.create(formData);
      closeModal();
      showToast('Venda registrada com sucesso!');
      await loadVendas();
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });
}

function openEditVenda(id, vendas) {
  const venda = vendas.find((v) => v.id === id);
  if (!venda) return;

  renderVendaForm(venda, async (formData) => {
    try {
      await VendasAPI.update(id, formData);
      closeModal();
      showToast('Venda atualizada com sucesso!');
      await loadVendas();
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });
}

async function deleteVenda(id) {
  if (!confirm('Tem certeza que deseja excluir esta venda?')) return;
  try {
    await VendasAPI.delete(id);
    showToast('Venda excluída com sucesso!');
    await loadVendas();
  } catch (err) {
    showToast(`Erro: ${err.message}`, 'error');
  }
}

// ─── Loader ─────────────────────────────────────────────────────────────────

/**
 * Loads and renders the Vendas view.
 */
export async function loadVendas() {
  try {
    const data = await VendasAPI.getAll();
    const vendas = data.listaVendas ?? [];
    renderVendas(vendas, {
      onCreate: () => openCreateVenda(),
      onEdit: (id) => openEditVenda(id, vendas),
      onDelete: (id) => deleteVenda(id),
    });
  } catch (err) {
    renderError(`Erro ao carregar vendas: ${err.message}`);
  }
}
