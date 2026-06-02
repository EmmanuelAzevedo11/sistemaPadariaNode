import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const route = Router();
const prisma = new PrismaClient();

route.get('/dashboard/summary', async (req, res) => {
  try {
    const { inicio, fim } = req.query;

    // Configura o período: mês atual padrão
    const hoje = new Date();
    const dataInicio = inicio ? new Date(inicio as string) : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const dataFim = fim ? new Date(fim as string) : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

    // 1. Query: Top Produtos (Agrupados por quantidade)
    const agrupadoProdutos = await prisma.itemVenda.groupBy({
      by: ['produtoId'],
      where: { venda: { dataHoraVenda: { gte: dataInicio, lte: dataFim } } },
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: 'desc' } },
      take: 5
    });

    const produtos = await Promise.all(
      agrupadoProdutos.map(async (item) => {
        const prod = await prisma.produto.findUnique({ where: { id: item.produtoId }, select: { nomeProduto: true } });
        return {
          nome: prod?.nomeProduto || 'Produto Sem Nome',
          quantidade: Number(item._sum.quantidade || 0)
        };
      })
    );

    // 2. Query: Desempenho da Equipe (Agrupados por Valor Líquido)
    const agrupadoVendedores = await prisma.venda.groupBy({
      by: ['vendedorId'],
      where: { dataHoraVenda: { gte: dataInicio, lte: dataFim } },
      _sum: { valorTotalLiquido: true },
      orderBy: { _sum: { valorTotalLiquido: 'desc' } },
      take: 5
    });

    const vendedores = await Promise.all(
      agrupadoVendedores.map(async (item) => {
        if (!item.vendedorId) return { nome: 'Venda s/ Vendedor', total: 0 };
        const vend = await prisma.vendedor.findUnique({ where: { id: item.vendedorId }, select: { nome: true } });
        return {
          nome: vend?.nome || 'Vendedor Antigo',
          total: Number(item._sum.valorTotalLiquido || 0)
        };
      })
    );

    // 3. Métricas Rápidas Extras para o Dashboard brilhar
    const totalFaturadoPeriodo = vendedores.reduce((acc, v) => acc + v.total, 0);
    const totalItensVendidos = produtos.reduce((acc, p) => acc + p.quantidade, 0);

    return res.status(200).json({
      meta: { totalFaturado: totalFaturadoPeriodo, totalItens: totalItensVendidos },
      produtos,
      vendedores
    });

  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

export default route;