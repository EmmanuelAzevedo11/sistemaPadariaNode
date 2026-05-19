import { setActiveNav, renderLoading } from './src/views/shared/layout.js';
import { closeModal } from './src/views/shared/modal.js';

// ─── Views ──────────────────────────────────────────────────────────────────
import { loadDashboard } from './src/views/dashboard/dashboardView.js';
import { loadProdutos } from './src/views/produtos/produtosView.js';
import { loadVendas } from './src/views/vendas/vendasView.js';
import { loadVendedores } from './src/views/vendedores/vendedoresView.js';
import { loadCategorias } from './src/views/categorias/categoriasView.js';
import { loadClientes } from './src/views/clientes/clientesView.js';

// ─── Router ─────────────────────────────────────────────────────────────────

const routes = {
  dashboard: loadDashboard,
  produtos: loadProdutos,
  vendas: loadVendas,
  vendedores: loadVendedores,
  categorias: loadCategorias,
  clientes: loadClientes,
};

async function navigate(view) {
  window.location.hash = view;
  setActiveNav(view);
  renderLoading();
  const handler = routes[view];
  if (handler) await handler();
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

function init() {
  // Sidebar navigation
  document.querySelectorAll('.nav__item').forEach((item) => {
    item.addEventListener('click', () => navigate(item.dataset.view));
  });

  // Modal close button
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);

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
