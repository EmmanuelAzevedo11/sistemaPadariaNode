/**
 * Central re-export for every API module.
 * Import from here so consumers don't need to know the internal file layout.
 *
 * Usage:
 *   import { ProdutosAPI, VendasAPI } from './api/index.js';
 */

export { StatusAPI } from './statusApi.js';
export { ProdutosAPI } from './produtosApi.js';
export { VendasAPI } from './vendasApi.js';
export { VendedorAPI } from './vendedorApi.js';
export { CategoriasAPI } from './categoriasApi.js';
export { ClientesAPI } from './clientesApi.js';
export { FormaPagamentoAPI } from './formaPagamentoApi.js';
export { ItemVendaAPI } from './itemVendaApi.js';
