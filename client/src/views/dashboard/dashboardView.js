import { DashboardAPI } from '../../api/dashboardApi.js';
import { formatCurrency } from '../../utils.js';

// Função mestre chamada pelo roteador app.js ao clicar em "dashboard"
export async function loadDashboard() {
  try {
    const dados = await DashboardAPI.getSummary();
    renderLayoutDashboard(dados);
    registrarEventosFiltro();
  } catch (err) {
    console.error("Falha ao inicializar o dashboard:", err);
    document.getElementById('main-content').innerHTML = `
      <div style="padding: 24px; color: var(--color-danger);">
        <h3>⚠️ Erro ao carregar o painel</h3>
        <p>${err.message}</p>
      </div>`;
  }
}

function renderLayoutDashboard(dados) {
  const main = document.getElementById('main-content');
  if (!main) return;

  // Encontra o maior valor para servir de base (100%) nos gráficos de barra
  const maxProd = dados.produtos?.length > 0 ? Math.max(...dados.produtos.map(p => p.quantidade)) : 1;
  const maxVend = dados.vendedores?.length > 0 ? Math.max(...dados.vendedores.map(v => v.total)) : 1;

  main.innerHTML = `
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 class="page-title" style="font-size: 1.8rem; font-weight: 700; color: var(--color-text);">Painel de Resultados</h1>
        <p class="page-subtitle" style="color: var(--color-text-muted);">Métricas estratégicas e escala de tempo</p>
      </div>
      
      <div class="filter-group" style="display: flex; gap: 8px; align-items: center; background: var(--color-surface); padding: 8px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
        <input type="date" id="dash-inicio" class="form__input" style="width: auto; margin: 0; padding: 6px 12px;">
        <span style="color: var(--color-text-muted);">até</span>
        <input type="date" id="dash-fim" class="form__input" style="width: auto; margin: 0; padding: 6px 12px;">
        <button id="btn-dash-filtrar" class="btn btn--primary" style="padding: 8px 16px;">Filtrar</button>
      </div>
    </div>

    <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="kpi-card" style="background: var(--color-surface); padding: 20px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border-left: 4px solid var(--color-primary);">
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 4px; text-transform: uppercase; font-weight: 600;">Faturamento Líquido</p>
        <h2 style="font-size: 1.6rem; color: var(--color-text); font-weight: 700;">${formatCurrency(dados.meta?.totalFaturado || 0)}</h2>
      </div>
      <div class="kpi-card" style="background: var(--color-surface); padding: 20px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border-left: 4px solid #10b981;">
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 4px; text-transform: uppercase; font-weight: 600;">Volume de Itens Saídos</p>
        <h2 style="font-size: 1.6rem; color: var(--color-text); font-weight: 700;">${dados.meta?.totalItens || 0} un</h2>
      </div>
    </div>

    <div class="charts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 24px;">
      
      <div class="chart-card" style="background: var(--color-surface); padding: 24px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
        <h3 style="margin-bottom: 20px; font-size: 1.1rem; font-weight: 600; color: var(--color-text);">🏆 Top Produtos (Volume de Saídas)</h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${dados.produtos && dados.produtos.length > 0 ? dados.produtos.map(p => {
    const pct = (p.quantidade / maxProd) * 100;
    return `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 4px;">
                  <span style="font-weight: 500; color: var(--color-text);">${p.nome}</span>
                  <span style="font-weight: 600; color: var(--color-text-muted);">${p.quantidade} un</span>
                </div>
                <div style="width: 100%; background: var(--color-surface-2); height: 12px; border-radius: 6px; overflow: hidden;">
                  <div style="width: ${pct}%; background: linear-gradient(90deg, var(--color-primary), #f59e0b); height: 100%; border-radius: 6px; transition: width 0.5s ease;"></div>
                </div>
              </div>`;
  }).join('') : '<p style="color: var(--color-text-muted); font-size: 0.9rem;">Nenhuma movimentação de produto no período.</p>'}
        </div>
      </div>

      <div class="chart-card" style="background: var(--color-surface); padding: 24px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
        <h3 style="margin-bottom: 20px; font-size: 1.1rem; font-weight: 600; color: var(--color-text);">⭐ Ranking da Equipe (Faturamento)</h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${dados.vendedores && dados.vendedores.length > 0 ? dados.vendedores.map(v => {
    const pct = (v.total / maxVend) * 100;
    return `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 4px;">
                  <span style="font-weight: 500; color: var(--color-text);">${v.nome}</span>
                  <span style="font-weight: 600; color: var(--color-primary);">${formatCurrency(v.total)}</span>
                </div>
                <div style="width: 100%; background: var(--color-surface-2); height: 12px; border-radius: 6px; overflow: hidden;">
                  <div style="width: ${pct}%; background: linear-gradient(90deg, #10b981, #3b82f6); height: 100%; border-radius: 6px; transition: width 0.5s ease;"></div>
                </div>
              </div>`;
  }).join('') : '<p style="color: var(--color-text-muted); font-size: 0.9rem;">Nenhum faturamento registrado no período.</p>'}
        </div>
      </div>

    </div>
  `;
}

function registrarEventosFiltro() {
  const btn = document.getElementById('btn-dash-filtrar');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const inicio = document.getElementById('dash-inicio').value;
    const fim = document.getElementById('dash-fim').value;

    try {
      const novosDados = await DashboardAPI.getSummary(inicio, fim);
      renderLayoutDashboard(novosDados);

      // Preserva os valores inseridos nos inputs após renderizar o HTML novamente
      document.getElementById('dash-inicio').value = inicio;
      document.getElementById('dash-fim').value = fim;

      registrarEventosFiltro(); // Re-vincula o evento do botão
    } catch (err) {
      alert("Erro ao filtrar dados do painel: " + err.message);
    }
  });
}