import { prisma } from "../lib/prisma";

export const buscarClientes = async () => {
    const listaClientes = await prisma.cliente.findMany();

    if(listaClientes.length === 0 ){
        throw new Error("Não há clientes cadastrados ainda");
    }

    return listaClientes;
}

export const buscarClientesPorId = async (id: number) => {
    const cliente = await prisma.cliente.findUnique({
        where: {
            id: Number(id)
        }
    });

    if(!cliente){
        throw new Error("Esse cliente não existe");
    }

    return cliente;
}

export const adicionarCliente = async (nomeCliente: string, cpf: string, email: string, dataCadastro: Date, telefone?: string) => {
    
    if(!nomeCliente || !cpf || !email || !dataCadastro){
        throw new Error("Dados inseridos incorretamente");
    }

    const novoCliente = await prisma.cliente.create({
        data: {
            nomeCliente: nomeCliente,
            cpf: cpf,
            email: email,
            dataCadastro: dataCadastro,
            telefone: telefone ?? ''
        }
    });

    return novoCliente;
}

export const updateCliente = async (id: number, dados: any) => {

    const {nomeCliente, cpf,email,dataCadastro, telefone} = dados;
    const clienteExiste = await buscarClientesPorId(id);

    if(!clienteExiste){
        throw new Error("Cliente não existe");
    }

    if(!nomeCliente || !cpf || !email || !dataCadastro){
        throw new Error("Dados inválidos");
    }

    const clienteAtualizado = await prisma.cliente.update({
        where: {id: Number(id)},
        data: {
            nomeCliente: nomeCliente,
            cpf: cpf,
            email: email,
            dataCadastro: dataCadastro,
            telefone: telefone ?? ''
        }
    });

    return clienteAtualizado;
}

export const deleteCliente = async (id: number) => {
    const cliente = await buscarClientesPorId(id);

    await prisma.cliente.delete({
        where: {
            id: Number(id)
        }
    });

    return true;
}
