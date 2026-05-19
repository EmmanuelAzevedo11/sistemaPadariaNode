import { 
  VendasAPI, 
  VendedorAPI, 
  ClientesAPI, 
  FormaPagamentoAPI 
} from '../../api/index.js'; // Certifique-se de que essas APIs existem e estão exportadas
import { openModal, closeModal } from '../shared/modal.js';
import { renderError } from '../shared/layout.js';
import { formatCurrency, formatDate, showToast } from '../../utils.js';

// ─── Render ─────────────────────────────────────────────────────────────────

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

function renderVendaForm(venda, vendedores, clientes, formasPagamento, onSubmit) {
  const isEditing = !!venda;

  // Busca dados para preencher a tela caso seja uma edição
  let vendCpf = '', vendNome = '';
  let cliCpf = '', cliNome = '';

  if (isEditing) {
    const vendEncontrado = vendedores.find((v) => v.id === venda.vendedorId);
    if (vendEncontrado) {
      vendCpf = vendEncontrado.cpf;
      vendNome = vendEncontrado.nome;
    }

    const cliEncontrado = clientes.find((c) => c.id === venda.clienteId);
    if (cliEncontrado) {
      cliCpf = cliEncontrado.cpf;
      cliNome = cliEncontrado.nomeCliente;
    }
  }

  // 1. Removido o <div class="modal__header"> manual daqui
  const formHtml = `
    <form id="venda-form" class="form">
      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-bruto">Total Bruto (R$)</label>
          <input class="form__input" id="f-bruto" name="valorTotalBruto" type="number" step="0.01"
            placeholder="0.00" value="${isEditing ? venda.valorTotalBruto : ''}" required />
        </div>
        <div class="form__group">
          <label class="form__label" for="f-liquido">Total Líquido (R$)</label>
          <input class="form__input" id="f-liquido" name="valorTotalLiquido" type="number" step="0.01"
            placeholder="0.00" value="${isEditing ? venda.valorTotalLiquido : ''}" required />
        </div>
      </div>
      
      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-desconto">Desconto (%)</label>
          <input class="form__input" id="f-desconto" name="descontoAplicado" type="number" step="0.01"
            placeholder="0" value="${isEditing ? venda.descontoAplicado ?? 0 : '0'}" />
        </div>
        <div class="form__group">
          <label class="form__label" for="f-data-venda">Data da Venda</label>
          <input class="form__input" id="f-data-venda" name="dataHoraVenda" type="datetime-local"
            value="${isEditing && venda.dataHoraVenda ? venda.dataHoraVenda.slice(0, 16) : ''}" required />
        </div>
      </div>

      <div style="background: var(--color-surface-2); padding: 12px; border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 12px; margin: 8px 0;">
        
        <div style="display: grid; grid-template-columns: 1.2fr 2fr; gap: 12px; align-items: end;">
          <div class="form__group">
            <label class="form__label" for="f-cpf-vendedor">CPF Vendedor</label>
            <div style="display: flex; gap: 6px;">
              <input class="form__input" id="f-cpf-vendedor" type="text" placeholder="Apenas números" value="${vendCpf}" style="width: 100%;" />
              <button type="button" class="btn btn--secondary btn--sm" id="btn-valida-vendedor" style="padding: 0 10px;">Validar</button>
            </div>
          </div>
          <div class="form__group">
            <label class="form__label" for="f-nome-vendedor">Vendedor Selecionado</label>
            <input class="form__input" id="f-nome-vendedor" type="text" readonly placeholder="Aguardando validação..." value="${vendNome}" required />
            <input type="hidden" id="f-vendedor-id" name="vendedorId" value="${isEditing ? venda.vendedorId : ''}" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.2fr 2fr; gap: 12px; align-items: end;">
          <div class="form__group">
            <label class="form__label" for="f-cpf-cliente">CPF Cliente</label>
            <div style="display: flex; gap: 6px;">
              <input class="form__input" id="f-cpf-cliente" type="text" placeholder="Apenas números" value="${cliCpf}" style="width: 100%;" />
              <button type="button" class="btn btn--secondary btn--sm" id="btn-valida-cliente" style="padding: 0 10px;">Validar</button>
            </div>
          </div>
          <div class="form__group">
            <label class="form__label" for="f-nome-cliente">Cliente Selecionado</label>
            <input class="form__input" id="f-nome-cliente" type="text" readonly placeholder="Aguardando validação..." value="${cliNome}" required />
            <input type="hidden" id="f-cliente-id" name="clienteId" value="${isEditing ? venda.clienteId : ''}" required />
          </div>
        </div>

      </div>

      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-forma-pag">Forma Pagamento</label>
          <select class="form__input" id="f-forma-pag" name="formaPagamentoId" required>
            <option value="" disabled ${!isEditing ? 'selected' : ''}>Selecione...</option>
            ${formasPagamento.map(fp => `
              <option value="${fp.id}" ${isEditing && venda.formaPagamentoId === fp.id ? 'selected' : ''}>
                ${fp.nome}
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form__group">
          <label class="form__label" for="f-cpf-nf">CPF Nota Fiscal</label>
          <input class="form__input" id="f-cpf-nf" name="cpfNotaFiscal" type="text"
            placeholder="Ex: 00000000000" value="${isEditing ? venda.cpfNotaFiscal ?? '' : ''}" />
        </div>
      </div>

      <div class="form__actions" style="margin-top: 8px;">
        <button type="button" class="btn btn--secondary" id="btn-cancel-modal">Cancelar</button>
        <button type="submit" class="btn btn--primary">${isEditing ? 'Salvar Alterações' : 'Registrar Venda'}</button>
      </div>
    </form>
  `;

  openModal(isEditing ? 'Editar Venda' : 'Nova Venda', formHtml);

  // 2. Removido o event listener do 'btn-close-modal' que estava quebrando,
  // pois o seu modal.js já deve cuidar do fechamento pelo 'X' nativo.
  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);

  // Lógica de validação do Vendedor
  document.getElementById('btn-valida-vendedor').addEventListener('click', () => {
    const cpfDigitado = document.getElementById('f-cpf-vendedor').value.trim();
    const vendedor = vendedores.find(v => v.cpf === cpfDigitado);
    
    if (vendedor) {
      document.getElementById('f-nome-vendedor').value = vendedor.nome;
      document.getElementById('f-vendedor-id').value = vendedor.id;
      showToast('Vendedor validado!', 'success');
    } else {
      document.getElementById('f-nome-vendedor').value = '';
      document.getElementById('f-vendedor-id').value = '';
      showToast('Nenhum vendedor encontrado com este CPF', 'error');
    }
  });

  // Lógica de validação do Cliente
  document.getElementById('btn-valida-cliente').addEventListener('click', () => {
    const cpfDigitado = document.getElementById('f-cpf-cliente').value.trim();
    const cliente = clientes.find(c => c.cpf === cpfDigitado);
    
    if (cliente) {
      document.getElementById('f-nome-cliente').value = cliente.nomeCliente;
      document.getElementById('f-cliente-id').value = cliente.id;
      showToast('Cliente validado!', 'success');
    } else {
      document.getElementById('f-nome-cliente').value = '';
      document.getElementById('f-cliente-id').value = '';
      showToast('Nenhum cliente encontrado com este CPF', 'error');
    }
  });

  // Submit do formulário
  document.getElementById('venda-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    if (!data.vendedorId || !data.clienteId) {
      showToast('Valide o CPF do vendedor e do cliente antes de salvar.', 'error');
      return;
    }

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

async function fetchDependencies() {
  // Dispara as 3 buscas ao mesmo tempo para carregar mais rápido
  const [resVend, resCli, resFormas] = await Promise.all([
    VendedorAPI.getAll(),
    ClientesAPI.getAll(),
    FormaPagamentoAPI.getAll()
  ]);

  // Acessa a propriedade correta retornada por cada uma das APIs
  const vendedores = resVend?.vendedores || [];
  const clientes = resCli?.listaClientes || [];
  const formasPagamento = resFormas?.listaFormaPagamentos || [];

  return { vendedores, clientes, formasPagamento };
}

async function openCreateVenda() {
  try {
    const { vendedores, clientes, formasPagamento } = await fetchDependencies();

    renderVendaForm(null, vendedores, clientes, formasPagamento, async (formData) => {
      try {
        await VendasAPI.create(formData);
        closeModal();
        showToast('Venda registrada com sucesso!');
        await loadVendas();
      } catch (err) {
        showToast(`Erro: ${err.message}`, 'error');
      }
    });
  } catch (err) {
    showToast(`Erro ao carregar dados do formulário: ${err.message}`, 'error');
  }
}

async function openEditVenda(id, vendas) {
  const venda = vendas.find((v) => v.id === id);
  if (!venda) return;

  try {
    const { vendedores, clientes, formasPagamento } = await fetchDependencies();

    renderVendaForm(venda, vendedores, clientes, formasPagamento, async (formData) => {
      try {
        await VendasAPI.update(id, formData);
        closeModal();
        showToast('Venda atualizada com sucesso!');
        await loadVendas();
      } catch (err) {
        showToast(`Erro: ${err.message}`, 'error');
      }
    });
  } catch (err) {
    showToast(`Erro ao carregar dados do formulário: ${err.message}`, 'error');
  }
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