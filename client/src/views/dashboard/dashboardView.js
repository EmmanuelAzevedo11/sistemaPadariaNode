import { StatusAPI } from '../../api/index.js';

// ─── Dashboard View ─────────────────────────────────────────────────────────

/**
 * Renders the dashboard view.
 * @param {{ apiOnline: boolean }} data
 */
function renderDashboard({ apiOnline }) {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="landing-page">
      <div class="landing-header">
        <span class="landing-icon">🥐</span>
        <h1 class="landing-title">Bem-vindo(a) ao Sistema da Padaria!</h1>
        <p class="landing-subtitle">Gerencie seus produtos, acompanhe o estoque e facilite o seu dia a dia.</p>
      </div>
      
      <div class="landing-content">
        <div class="landing-card">
          <span class="landing-card-icon">📦</span>
          <h3>Gestão de Produtos</h3>
          <p>Acesse o menu "Produtos" na barra lateral para adicionar, editar ou remover itens do seu catálogo.</p>
        </div>
        
        <div class="landing-card">
          <span class="landing-card-icon">🚀</span>
          <h3>Sistema Conectado</h3>
          <p>O seu sistema está operando corretamente e conectado à base de dados. Status da API: <strong class="${apiOnline ? 'text--success' : 'text--error'}">${apiOnline ? 'Online' : 'Offline'}</strong>.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Loads and renders the dashboard, checking API connectivity.
 */
export async function loadDashboard() {
  try {
    await StatusAPI.check();
    renderDashboard({ apiOnline: true });
  } catch {
    renderDashboard({ apiOnline: false });
  }
}
