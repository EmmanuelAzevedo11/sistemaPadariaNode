import { prisma } from "../lib/prisma";


export const buscarItensPorVenda = async (vendaId: number) => {
    const itens = await prisma.itemVenda.findMany({
        where: { vendaId: Number(vendaId) },
        include: {
            produto: true 
        }
    });

    if (itens.length === 0) {
        throw new Error("Nenhum item encontrado para esta venda.");
    }

    return itens;
};


export const adicionarItemVenda = async (vendaId: number, produtoId: number, quantidade: number,  precoUnitario: number) => {

    const produto = await prisma.produto.findUnique({
        where: { id: Number(produtoId) }
    });

    if (!produto) {
        throw new Error("Produto não encontrado.");
    }

    const subtotal = quantidade * precoUnitario;

    const novoItem = await prisma.itemVenda.create({
        data: {
            quantidade,
            precoUnitario,
            subtotal,
            venda: { connect: { id: Number(vendaId) } },
            produto: { connect: { id: Number(produtoId) } }
        }
    });

    return novoItem;
};


export const removerItemVenda = async (id: number) => {
    const item = await prisma.itemVenda.findUnique({
        where: { id: Number(id) }
    });

    if (!item) {
        throw new Error("Item não encontrado.");
    }

    await prisma.itemVenda.delete({
        where: { id: Number(id) }
    });

    return true;
};