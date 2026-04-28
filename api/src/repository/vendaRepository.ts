
import { prisma } from "../lib/prisma";

export const buscarVendas = async () => {
    const listaVendas = await prisma.venda.findMany();

    if(listaVendas.length === 0 ){
        // throw new Error("Não existe vendas ainda");
        return [];
    }

    return listaVendas;
}

export const buscarVendaPorId = async (id: number) => {
    const venda = await prisma.venda.findUnique({
        where: {
            id: Number(id)
        }
    });

    if(!venda){
        throw new Error("Não existe essa venda");
    }

    return venda;
}

export const criarVenda = async (valorTotalBruto: number,  valorTotalLiquido: number,  dataHoraVenda: Date, vendedorId: number, 
    clienteId: number, formaPagamentoId: number , descontoAplicado?: number, cpfNotaFiscal?: string,) => {
        
        if(!valorTotalBruto || !valorTotalLiquido || !dataHoraVenda || !vendedorId || !clienteId || !formaPagamentoId){
            throw new Error("Dados inválidos para realizar a venda");
        }

        const vendaCriada = await prisma.venda.create({
            data: {
                valorTotalBruto: valorTotalBruto,
                valorTotalLiquido: valorTotalLiquido,
                dataHoraVenda: dataHoraVenda,
                vendedor: {
                    connect: {id: Number(vendedorId)}
                },
                cliente: {
                    connect: {id: Number(clienteId)}
                },
                formaPagamento: {
                    connect: {id: Number(formaPagamentoId)}
                },
                descontoAplicado: descontoAplicado ?? undefined,
                cpfNotaFiscal: cpfNotaFiscal ?? null,
            }
        });

        return vendaCriada;
};

export const updateVendas = async (id: number, dados: any) => {
    const vendaEncontrada = await buscarVendaPorId(id);

    if(!vendaEncontrada){
        throw new Error("Venda não encontrada");
    }

    const { valorTotalBruto , valorTotalLiquido  ,dataHoraVenda, vendedorId ,
    clienteId ,formaPagamentoId, descontoAplicado = 0 , cpfNotaFiscal = undefined } = dados;


    if(!valorTotalBruto || !valorTotalLiquido || !dataHoraVenda || !vendedorId || !clienteId || !formaPagamentoId){
        throw new Error("Dados inválidos para realizar a venda");
    }

    const vendaAtualizada = await prisma.venda.update({
        where: { id: Number(id) },
        data: {
            valorTotalBruto: valorTotalBruto,
            valorTotalLiquido: valorTotalLiquido,
            dataHoraVenda: dataHoraVenda,
            vendedorId: vendedorId,
            clienteId: clienteId,
            formaPagamentoId: formaPagamentoId,
            descontoAplicado: descontoAplicado,
            cpfNotaFiscal: cpfNotaFiscal
        }
    });

    return vendaAtualizada;
};

export const deleteVenda = async(id:number) => {
    const vendaExiste = await buscarVendaPorId(id);

    if(!vendaExiste){
        throw new Error("Essa venda não existe");   
    }

    await prisma.venda.delete({
        where: {
            id: Number(id)
        }
    });

    return true

}