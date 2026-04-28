// ─── Modal ──────────────────────────────────────────────────────────────────

/**
 * Opens a generic modal with a title and HTML content.
 * @param {string} title
 * @param {string} bodyHtml
 */
export function openModal(title, bodyHtml) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-overlay').classList.add('modal--open');
}

/**
 * Closes the open modal.
 */
export function closeModal() {
  document.getElementById('modal-overlay').classList.remove('modal--open');
}
