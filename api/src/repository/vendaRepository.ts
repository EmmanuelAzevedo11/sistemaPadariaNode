
import { prisma } from "../lib/prisma";
import { buscarItensPorVenda } from "./itemVendasRepository";

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

// 1. Adicione o parâmetro 'itens' na assinatura da função
export const criarVenda = async (
    valorTotalBruto: number,  
    valorTotalLiquido: number,  
    dataHoraVenda: string | Date, 
    vendedorId: number, 
    clienteId: number, 
    formaPagamentoId: number , 
    descontoAplicado?: number, 
    cpfNotaFiscal?: string,
    itens: { produtoId: number; quantidade: number; precoUnitario: number }[] = [] // <-- Novo parâmetro
) => {
        
    if(!valorTotalBruto || !valorTotalLiquido || !dataHoraVenda || !vendedorId || !formaPagamentoId){
        throw new Error("Dados inválidos para realizar a venda");
    }

    const vendaCriada = await prisma.venda.create({
        data: {
            valorTotalBruto: valorTotalBruto,
            valorTotalLiquido: valorTotalLiquido,
            dataHoraVenda: new Date(dataHoraVenda),
            vendedor: {
                connect: { id: Number(vendedorId) }
            },
            cliente: {
                connect: { id: 1 } 
            },
            formaPagamento: {
                connect: { id: Number(formaPagamentoId) }
            },
            descontoAplicado: descontoAplicado ?? undefined,
            cpfNotaFiscal: cpfNotaFiscal ?? null,
            
            // 👇 AQUI: Adicionado o cálculo do subtotal para o Prisma não reclamar
            itens: {
                create: itens.map(item => {
                    const qtd = Number(item.quantidade);
                    const preco = Number(item.precoUnitario);
                    
                    return {
                        produtoId: Number(item.produtoId),
                        quantidade: qtd,
                        precoUnitario: preco,
                        subtotal: Number((qtd * preco).toFixed(2)) // <-- CÁLCULO DO SUBTOTAL AQUI
                    };
                })
            }
        },
        include: {
            itens: true
        }
    });


    // 3. Agora que os itens existem no banco, essa linha não vai mais quebrar!
    const listaItensVenda = await buscarItensPorVenda(vendaCriada.id);
    
    return vendaCriada;
};

export const retirarEstoqueItemVenda = async (vendaId: number) => {
    if (!vendaId) {
        throw new Error("ID da venda é obrigatório para dar baixa no estoque.");
    }

    return await prisma.$transaction(async (tx) => {
        
        const itensDaVenda = await tx.itemVenda.findMany({
            where: { vendaId: Number(vendaId) },
            include: { produto: true } 
        });

        if (!itensDaVenda || itensDaVenda.length === 0) {
            throw new Error(`Nenhum item encontrado para a venda ID ${vendaId}.`);
        }

        for (const item of itensDaVenda) {
            
            if (Number(item.produto.estoque) < Number(item.quantidade)) {
                throw new Error(
                    `Estoque insuficiente para o produto "${item.produto.nomeProduto}". ` +
                    `Disponível: ${item.produto.estoque}, Vendido: ${item.quantidade}`
                );
            }

            const estoqueAtual = Number(item.produto.estoque);
            const quantidadeVendida = Number(item.quantidade);
            const novoEstoque = estoqueAtual - quantidadeVendida;

            // 2. Faz o update passando o valor final convertido em String (ou número se o banco aceitar)
            await tx.produto.update({
                where: { id: item.produtoId },
                data: {
                    // Se o banco for String, ele vai salvar o texto. Se for número, o Prisma aceita Number.
                    estoque: String(novoEstoque) 
                }
            });
        }

        return { success: true, message: "Estoque atualizado com sucesso." };
    });
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
            dataHoraVenda: dataHoraVenda ? new Date(dataHoraVenda) : undefined,
            vendedorId: vendedorId,
            clienteId: clienteId,
            formaPagamentoId: formaPagamentoId,
            descontoAplicado: descontoAplicado,
            cpfNotaFiscal: cpfNotaFiscal
        }
    });

    return vendaAtualizada;
};

export const deleteVenda = async (id: number) => {
    const vendaExiste = await buscarVendaPorId(id);

    if (!vendaExiste) {
        throw new Error("Essa venda não existe");
    }

    await prisma.$transaction([

        prisma.itemVenda.deleteMany({
            where: {
                vendaId: Number(id) 
            }
        }),
        
        prisma.venda.delete({
            where: {
                id: Number(id)
            }
        })
    ]);

    return true;
};


// daqui para baixo são funções que vão mostrar alguns dados, como vendedor que mais vendeu, produto mais vendido
export const getProdutosMaisVendidos = async (dataInicio: Date, dataFim: Date) => {
  return await prisma.itemVenda.groupBy({
    by: ['produtoId'],
    where: {
      venda: {
        dataHoraVenda: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
    },
    _sum: {
      quantidade: true,
    },
    orderBy: {
      _sum: {
        quantidade: 'desc',
      },
    },
    take: 5, 
  });
};

export const getTopVendedores = async (dataInicio: Date, dataFim: Date) => {
  return await prisma.venda.groupBy({
    by: ['vendedorId'],
    where: {
      dataHoraVenda: {
        gte: dataInicio,
        lte: dataFim,
      },
    },
    _sum: {
      valorTotalLiquido: true,
    },
    orderBy: {
      _sum: {
        valorTotalLiquido: 'desc',
      },
    },
    take: 5,
  });
};