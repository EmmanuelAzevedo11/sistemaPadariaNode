import {
  VendasAPI,
  VendedorAPI,
  FormaPagamentoAPI,
  ProdutosAPI
} from '../../api/index.js';
import { openModal, closeModal } from '../shared/modal.js';
import { renderError } from '../shared/layout.js';
import { formatCurrency, formatDate, showToast } from '../../utils.js';

// ─── Render ─────────────────────────────────────────────────────────────────

function renderVendas(vendas, { onDelete, onCreate }) {
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
        <p class="page-subtitle">Histórico de vendas realizadas (Frente de Caixa)</p>
      </div>
      <button class="btn btn--primary" id="btn-create-venda">+ Nova Venda</button>
    </div>

    ${vendas.length === 0
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
    if (btn.dataset.action === 'delete') onDelete(id);
  });
}

// ─── Form (PDV com Carrinho e CPF na Nota Opcional) ─────────────────────────

function renderVendaForm(vendedores, formasPagamento, produtos, onSubmit) {
  let carrinho = [];

  const formHtml = `
    <form id="venda-form" class="form">
      
      <div style="background: var(--color-surface-2); padding: 12px; border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        
       

        <div class="form__group">
          <label class="form__label" for="f-cpf-nota">CPF Nota Fiscal (Opcional)</label>
          <input class="form__input" id="f-cpf-nota" name="cpfNotaFiscal" type="text" placeholder="Ex: 00000000000 (Digite se o cliente desejar)" maxlength="14" />
        </div>

      </div>

      <h3 style="margin: 12px 0 6px 0; font-size: 1rem; color: var(--color-text); font-weight: 600;">Produtos da Venda</h3>
      
      <div style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 12px; align-items: end; margin-bottom: 12px;">
        <div class="form__group">
          <label class="form__label" for="f-produto">Selecionar Produto</label>
          <select class="form__input" id="f-produto">
            <option value="" disabled selected>Escolha um produto...</option>
            ${produtos.map(p => {
    const pId = p.id;
    const pNome = p.nome || p.nomeProduto || p.descricao || 'Produto Sem Nome';
    const pPreco = p.preco || p.precoVenda || p.valor || p.valorUnitario || 0;
    return `<option value="${pId}" data-preco="${pPreco}">${pNome} - ${formatCurrency(pPreco)}</option>`;
  }).join('')}
          </select>
        </div>
        <div class="form__group">
          <label class="form__label" for="f-quantidade">Qtd.</label>
          <input class="form__input" id="f-quantidade" type="number" min="1" value="1" />
        </div>
        
      </div>
      <div class="col md-5">
          <button type="button" class="btn btn--primary btn--sm" id="btn-add-item" style="height: 38px; padding: 0 16px;">+ Inserir</button>
        </div>
      <div class="table-wrapper" style="max-height: 180px; overflow-y: auto; margin-bottom: 16px; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
        <table class="table" style="margin: 0;">
          <thead class="table__head">
            <tr>
              <th class="table__header">Item / Produto</th>
              <th class="table__header" style="text-align: center;">Qtd</th>
              <th class="table__header" style="text-align: right;">Subtotal</th>
              <th class="table__header" style="text-align: center;">Remover</th>
            </tr>
          </thead>
          <tbody id="carrinho-tbody">
            <tr>
              <td colspan="4" class="table__cell" style="text-align: center; color: var(--color-text-muted); padding: 16px;">
                Nenhum produto adicionado ao carrinho.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="form__row">
        <div class="form__group">
          <label class="form__label" for="f-forma-pag">Forma de Pagamento *</label>
          <select class="form__input" id="f-forma-pag" required>
            <option value="" disabled selected>Selecione...</option>
            ${formasPagamento.map(fp => `
              <option value="${fp.id}">${fp.nome}</option>
            `).join('')}
          </select>
        </div>
        <div class="form__group">
          <label class="form__label" for="f-desconto">Desconto no Total (%)</label>
          <input class="form__input" id="f-desconto" type="number" step="0.01" min="0" max="100" placeholder="0" value="0" />
        </div>
      </div>

      <div style="background: var(--color-surface-2); padding: 12px; border-radius: var(--radius-sm); margin: 12px 0; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;">
          <span style="color: var(--color-text-muted);">Total Bruto:</span>
          <span id="display-total-bruto" style="font-weight: 500;">R$ 0,00</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; border-top: 1px dashed var(--color-border); padding-top: 6px;">
          <span style="font-weight: 600; color: var(--color-text);">Total Líquido:</span>
          <span id="display-total-liquido" style="font-weight: 700; color: var(--color-primary);">R$ 0,00</span>
        </div>
      </div>

      <div class="form__actions" style="margin-top: 16px;">
        <button type="button" class="btn btn--secondary" id="btn-cancel-modal">Cancelar</button>
        <button type="submit" class="btn btn--primary">Finalizar Venda</button>
      </div>
    </form>
  `;

  openModal('Nova Venda', formHtml);
  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);

  // --- Lógica de Controle do Carrinho e Cálculos Computados ---
  const tbody = document.getElementById('carrinho-tbody');
  const descontoInput = document.getElementById('f-desconto');
  const brutoDisplay = document.getElementById('display-total-bruto');
  const liquidoDisplay = document.getElementById('display-total-liquido');

  const atualizarTotaisUI = () => {
    const descontoPorcentagem = parseFloat(descontoInput.value) || 0;
    const totalBruto = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const totalLiquido = totalBruto * (1 - (descontoPorcentagem / 100));

    brutoDisplay.innerText = formatCurrency(totalBruto);
    liquidoDisplay.innerText = formatCurrency(totalLiquido);

    if (carrinho.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="table__cell" style="text-align: center; color: var(--color-text-muted); padding: 16px;">
            Nenhum produto adicionado ao carrinho.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = carrinho.map((item, index) => `
      <tr class="table__row">
        <td class="table__cell">${item.nome}</td>
        <td class="table__cell" style="text-align: center;">${item.quantidade}</td>
        <td class="table__cell" style="text-align: right;">${formatCurrency(item.preco * item.quantidade)}</td>
        <td class="table__cell" style="text-align: center; width: 60px;">
          <button type="button" class="btn btn--sm btn--danger btn-remove-item" data-index="${index}" style="padding: 2px 8px;">X</button>
        </td>
      </tr>
    `).join('');
  };

  descontoInput.addEventListener('input', atualizarTotaisUI);

  // Inserção no Carrinho
  document.getElementById('btn-add-item').addEventListener('click', () => {
    const selectProd = document.getElementById('f-produto');
    const inputQtd = document.getElementById('f-quantidade');

    const produtoId = parseInt(selectProd.value);
    const quantidade = parseInt(inputQtd.value);

    if (!produtoId) {
      return showToast('Por favor, selecione um produto.', 'error');
    }
    if (!quantidade || quantidade < 1) {
      return showToast('A quantidade mínima de inserção é 1.', 'error');
    }

    const option = selectProd.options[selectProd.selectedIndex];
    const preco = parseFloat(option.dataset.preco) || 0;
    const textoOpcao = option.text;
    const nome = textoOpcao.substring(0, textoOpcao.lastIndexOf(' - ')) || textoOpcao;

    const itemExistente = carrinho.find(item => item.produtoId === produtoId);
    if (itemExistente) {
      itemExistente.quantidade += quantidade;
    } else {
      carrinho.push({ produtoId, nome, preco, quantidade });
    }

    selectProd.value = '';
    inputQtd.value = '1';

    atualizarTotaisUI();
    showToast('Produto inserido com sucesso!');
  });

  // Remoção do Carrinho
  tbody.addEventListener('click', (e) => {
    const btnRemove = e.target.closest('.btn-remove-item');
    if (!btnRemove) return;

    const index = parseInt(btnRemove.dataset.index);
    carrinho.splice(index, 1);

    atualizarTotaisUI();
    showToast('Produto removido.');
  });

  // --- Validação Assíncrona do Vendedor ---

  // --- Interceptação e Envio da Venda ---
  document.getElementById('venda-form').addEventListener('submit', (e) => {
    e.preventDefault();

    if (carrinho.length === 0) {
      return showToast('O carrinho está vazio. Insira itens para vender.', 'error');
    }



    const cpfNotaFiscalRaw = document.getElementById('f-cpf-nota').value.trim();
    // Se o usuário digitou algo, salva, senão manda null
    const cpfNotaFiscal = cpfNotaFiscalRaw.length > 0 ? cpfNotaFiscalRaw : null;

    const formaPagamentoId = document.getElementById('f-forma-pag').value;
    const descontoAplicado = parseFloat(descontoInput.value) || 0;

    const valorTotalBruto = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const valorTotalLiquido = valorTotalBruto * (1 - (descontoAplicado / 100));

    const payload = {
      clienteId: 1,
      cpfNotaFiscal,
      formaPagamentoId: parseInt(formaPagamentoId),
      descontoAplicado,
      valorTotalBruto,
      valorTotalLiquido,
      dataHoraVenda: new Date().toISOString(),
      itens: carrinho.map(item => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: item.preco
      }))
    };

    onSubmit(payload);
  });
}

// ─── Actions e barramento de dependências robusto ──────────────────────────

async function fetchDependencies() {
  const [resVend, resFormas, resProd] = await Promise.all([
    VendedorAPI.getAll(),
    FormaPagamentoAPI.getAll(),
    ProdutosAPI.getAll().catch(() => null)
  ]);

  const vendedores = resVend?.vendedores || [];
  const formasPagamento = resFormas?.listaFormaPagamentos || [];
  const produtos = resProd?.listaProdutos || resProd?.produtos || (Array.isArray(resProd) ? resProd : []);

  return { vendedores, formasPagamento, produtos };
}

async function openCreateVenda() {
  try {
    const { vendedores, formasPagamento, produtos } = await fetchDependencies();

    renderVendaForm(vendedores, formasPagamento, produtos, async (payload) => {
      try {
        const resposta = await VendasAPI.create(payload);
        console.log('Resposta completa do Servidor:', resposta);
        const vendaId = resposta.vendaCriada?.id || resposta.id;
        console.log(vendaId);
        if (vendaId) {
          await VendasAPI.finalizarEstoque(vendaId);
        } else {
          console.warn('Venda criada, mas o ID não foi capturado para dar baixa no estoque.');
        }
        closeModal();
        showToast('Venda realizada com sucesso!');
        await loadVendas();
      } catch (err) {
        showToast(`Erro na API: ${err.message}`, 'error');
      }
    });
  } catch (err) {
    showToast(`Falha estrutural ao coletar dependências: ${err.message}`, 'error');
  }
}

async function deleteVenda(id) {
  if (!confirm('Deseja realmente estornar/excluir este registro de venda?')) return;
  try {
    await VendasAPI.delete(id);
    showToast('Registro de venda removido!');
    await loadVendas();
  } catch (err) {
    showToast(`Erro ao deletar: ${err.message}`, 'error');
  }
}

// ─── Loader ─────────────────────────────────────────────────────────────────

export async function loadVendas() {
  try {

    const data = await VendasAPI.getAll();
    const vendas = data.listaVendas ?? [];
    renderVendas(vendas, {
      onCreate: () => openCreateVenda(),
      onDelete: (id) => deleteVenda(id),
    });
  } catch (err) {
    renderError(`Erro ao carregar histórico de vendas: ${err.message}`);
  }
}