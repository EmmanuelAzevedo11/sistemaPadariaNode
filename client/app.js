import { ProdutosAPI, StatusAPI } from './src/api.js';
import {
  setActiveNav,
  renderLoading,
  renderError,
  renderDashboard,
  renderProdutos,
  renderProdutoForm,
  closeModal,
} from './src/ui.js';
import { showToast } from './src/utils.js';

// ─── Router ─────────────────────────────────────────────────────────────────

const routes = {
  dashboard: loadDashboard,
  produtos: loadProdutos,
};

async function navigate(view) {
  window.location.hash = view;
  setActiveNav(view);
  renderLoading();
  const handler = routes[view];
  if (handler) await handler();
}

// ─── Views ──────────────────────────────────────────────────────────────────

async function loadDashboard() {
  try {
    await StatusAPI.check();
    renderDashboard({ apiOnline: true });
  } catch {
    renderDashboard({ apiOnline: false });
  }
}

async function loadProdutos() {
  try {
    const data = await ProdutosAPI.getAll();
    // API returns array or a message object when empty
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

// ─── Produto Actions ─────────────────────────────────────────────────────────

function openCreateProduto() {
  renderProdutoForm(null, async (formData) => {
    try {
      await ProdutosAPI.create(formData);
      closeModal();
      showToast('Produto criado com sucesso!');
      await loadProdutos();
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });
}

function openEditProduto(id, produtos) {
  const produto = produtos.find((p) => p.id === id);
  if (!produto) return;

  renderProdutoForm(produto, async (formData) => {
    try {
      await ProdutosAPI.update(id, formData);
      closeModal();
      showToast('Produto atualizado com sucesso!');
      await loadProdutos();
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });
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

// ─── Bootstrap ───────────────────────────────────────────────────────────────

function init() {
  // Sidebar navigation
  document.querySelectorAll('.nav__item').forEach((item) => {
    item.addEventListener('click', () => navigate(item.dataset.view));
  });

  // Modal backdrop close
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Read initial route from hash or default to dashboard
  const initialView = window.location.hash.replace('#', '') || 'dashboard';
  navigate(initialView);

  // Handle back/forward buttons
  window.addEventListener('hashchange', () => {
    const view = window.location.hash.replace('#', '') || 'dashboard';
    navigate(view);
  });
}

document.addEventListener('DOMContentLoaded', init);
