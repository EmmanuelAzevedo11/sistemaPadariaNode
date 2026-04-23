import { prisma } from "../lib/prisma";

export const buscarProdutoPorId = async (id: number) => {
    
    const produto  = await prisma.produto.findUnique({
        where: {
            id: Number(id)
        }
    });

    if(!produto){
        throw new Error("Esse produto não existe");
        
    }

    return produto;
}

export const buscarProdutos = async () => {

    const listaProdutos = await prisma.produto.findMany();

    if(listaProdutos.length == 0 ){
        throw new Error("Não há produtos cadastrados ainda");
    }

    return listaProdutos;
}

export const criarProduto = async (nomeProduto: string,codigo: string, preco: number, categoriaId: number, estoque: number) => {

    if(!nomeProduto && !codigo && !preco  && !categoriaId && !estoque){
        throw new Error("Falta um parâmetro para a criação de produto");
    }

    if(preco <= 0){
        throw new Error("Preço não pode ser 0");
        
    }

    const novoProduto = await prisma.produto.create({
            data: {
                nomeProduto: nomeProduto,
                codigo: codigo,
                estoque: estoque,
                preco: preco,
                categoria: {
                    connect: {id: Number(categoriaId)}
                }

            },
            include: {
                categoria: true
            }
         });

    return novoProduto;

}


export const updateProduto = async (id: number, dados: any) => {
    const produtoExiste = await buscarProdutoPorId(id);
    
    if (!produtoExiste) {
        throw new Error("Produto não encontrado para atualização");
    }

    const { nomeProduto, codigo, preco, categoriaId, estoque } = dados;

    const produtoAtualizado = await prisma.produto.update({
        where: { id: id },
        data: {
            nomeProduto,
            codigo,
            preco,
            estoque,
            categoria: categoriaId ? { connect: { id: Number(categoriaId) } } : undefined
        }
    });

    return produtoAtualizado;
}

export const deleteProduto = async (id: number) => {
    const produtoDeletado = buscarProdutoPorId(id);

    if(!id){
        throw new Error("Produto não encontrado");
        
    }

    await prisma.produto.delete({
            where: {
                id: Number(id)
            }
    });

    return true;
}