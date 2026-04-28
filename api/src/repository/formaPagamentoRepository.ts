import { prisma } from "../lib/prisma";


export const buscarTodasFormasDePagamento = async () => {
    const lista = await prisma.formaPagamento.findMany();

    if (lista.length === 0) {
        // throw new Error("Não há formas de pagamento cadastradas ainda.");
        return [];
    }

    return lista;
};


export const buscarFormaPagamentoPorId = async (id: number) => {
    const formaPagamento = await prisma.formaPagamento.findUnique({
        where: { id: Number(id) }
    });

    if (!formaPagamento) {
        throw new Error("Forma de pagamento não encontrada.");
    }

    return formaPagamento;
};


export const criarFormaPagamento = async (nome: string) => {
    if (!nome) {
        throw new Error("O nome da forma de pagamento é obrigatório.");
    }

    const novaForma = await prisma.formaPagamento.create({
        data: { nome }
    });

    return novaForma;
};


export const updateFormaPagamento = async (id: number, dados: any) => {
    await buscarFormaPagamentoPorId(id);

    const { nome } = dados;

    if (!nome) {
        throw new Error("Dados inválidos para atualização.");
    }

    const formaAtualizada = await prisma.formaPagamento.update({
        where: { id: Number(id) },
        data: { nome }
    });

    return formaAtualizada;
};

export const deleteFormaPagamento = async (id: number) => {
    await buscarFormaPagamentoPorId(id);

    await prisma.formaPagamento.delete({
        where: { id: Number(id) }
    });

    return true;
};