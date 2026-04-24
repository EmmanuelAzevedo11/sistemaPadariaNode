import { PrismaClient } from '@prisma/client';

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

  for (const cat of categorias) {
    const categoria = await prisma.categoria.create({
      data: cat,
    });
    console.log(`Categoria criada: ${categoria.nomeCategoria} (ID: ${categoria.id})`);
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
