import { prisma } from "../lib/prisma";

export const buscarVedendores = async () => {
    const listaVendedores = await prisma.vendedor.findMany();

    if(listaVendedores.length === 0){
        // throw new Error("Não há vendedores cadastrados ainda");
        return [];
    }

    return listaVendedores;
}

export const buscarVendedorPorId = async (id: number) => {
    const vendedor = await prisma.vendedor.findUnique({
        where: {
            id: Number(id)
        }
    });

    if(!vendedor){
        throw new Error("Não existe esse vendedor");
    }

    return vendedor;
}

export const criarVendedor = async (nome: string, cpf: string, email: string, senhaHash: string, telefone: string, dataCadastro: string | Date) => {

    if(!nome || !cpf || !email || !senhaHash || !telefone || !dataCadastro){
        throw new Error('Dados não estão corretos');
    }


    const vendedor = prisma.vendedor.create({
        data: {
            nome: nome,
            cpf: cpf, 
            email: email,
            senhaHash: senhaHash, 
            telefone: telefone,
            dataCadastro: new Date(dataCadastro)
        }
    });

    return vendedor;
}

export const updateVendedor = async (id: number, dados: any) => {
    
    const vendedorExiste = await buscarVendedorPorId(id);

    if(!vendedorExiste){
        throw new Error("Não existe esse vendedor");
    }

    const {nome, cpf,email,  senhaHash, telefone, dataCadastro } = dados;

    if(!nome && !cpf && !email && !senhaHash && !telefone && !dataCadastro){
        throw new Error('Dados não estão corretos');
    }

    const vendedorAtualizado = await prisma.vendedor.update({
        where: {id:id},
        data:{
            nome: nome,
            cpf: cpf,
            email : email,
            senhaHash: senhaHash,
            telefone: telefone,
            dataCadastro: dataCadastro ? new Date(dataCadastro) : undefined
        } 
    });


    return vendedorAtualizado;
}

export const deleteVendedor = async (id: number) => {
    const vendedorExiste = await buscarVendedorPorId(id);

    if(!vendedorExiste){
        throw new Error("Não existe esse vendedor");
    }

    await prisma.vendedor.delete({
        where: {
            id: Number(id)
        }
    });

    return true;
}

//buscando vendedor por email
export const buscarVendedorPorEmail = async (email: string) => {
    const vendedor = await prisma.vendedor.findUnique({
        where: { email }
    });

    if(!vendedor){
        throw new Error("Não existe esse vendedor");
    }

    return vendedor;
}