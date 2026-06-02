import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding...');

  // Criando Categorias
  const categorias = [
    { nomeCategoria: 'Pães', descricao: 'Pães frescos e assados na hora' },
    { nomeCategoria: 'Doces', descricao: 'Sobremesas e bolos variados' },
    { nomeCategoria: 'Salgados', descricao: 'Lanches e salgados fritos ou assados' },
    { nomeCategoria: 'Bebidas', descricao: 'Sucos, cafés e refrigerantes' },
  ];

  const senhaHash = await bcrypt.hash('123456',10);

  const vendedores = [
    {nome: 'Silva', cpf: '12345678910', senhaHash: senhaHash, telefone: '15996800433',email: 'silva@gmail.com', dataCadastro: new Date('2026-05-19T20:30:00')}
  ];

  const clientes = [
    {nomeCliente: 'Silverio', cpf:'12345678910', telefone: '15996800433', email: 'silverio@gmail.com', dataCadastro: new Date('2026-05-19T20:30:00') }
  ];

  const produtos = [
    {codigo: 'P001', nomeProduto: 'Pão Francês', preco: 0.80, categoriaId: 1, estoque: '150 unidades'},
    {codigo: 'P002', nomeProduto: 'Pão Integral', preco: 1.20, categoriaId: 1, estoque: '80 unidades'},
    {codigo: 'D001', nomeProduto: 'Bolo de Chocolate', preco: 35.00, categoriaId: 2, estoque: '10 unidades'},
  
  ];

  
  for (const cat of categorias) {
    const categoria = await prisma.categoria.create({
      data: cat,
    });
    console.log(`Categoria criada: ${categoria.nomeCategoria} (ID: ${categoria.id})`);
  }

  for(const vendedor of vendedores) {
    const novoVendedor = await prisma.vendedor.create({
      data: vendedor,
    });
  }

  for (const cliente of clientes){
    const novoCliente = await prisma.cliente.create({
      data: cliente,
    });
  }

  for(const produto of produtos){
    const novoProduto = await prisma.produto.create({
        data: produto,
    });
    console.log(`Produto criado com sucesso: ${novoProduto.id}`);
  }

  // Criando Formas de Pagamento (útil para vendas no futuro)
  const formasPagamento = ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix'];
  for (const forma of formasPagamento) {
    const pagamento = await prisma.formaPagamento.create({
      data: { nome: forma },
    });
    console.log(`Forma de Pagamento criada: ${pagamento.nome} (ID: ${pagamento.id})`);
  }

  console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
