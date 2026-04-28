// ─── Shared UI helpers ──────────────────────────────────────────────────────

/**
 * Sets the active navigation item in the sidebar.
 * @param {string} activeId - The ID of the nav item to mark as active.
 */
export function setActiveNav(activeId) {
  document.querySelectorAll('.nav__item').forEach((item) => {
    item.classList.toggle('nav__item--active', item.dataset.view === activeId);
  });
}

/**
 * Renders a loading spinner inside the main content area.
 */
export function renderLoading() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Carregando...</p>
    </div>
  `;
}

/**
 * Renders an error message inside the main content area.
 * @param {string} message
 */
export function renderError(message) {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div class="empty-state">
      <span class="empty-state__icon">⚠️</span>
      <p>${message}</p>
    </div>
  `;
}
