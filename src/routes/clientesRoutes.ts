import { Router } from "express";
import { adicionarCliente, buscarClientes, buscarClientesPorId, deleteCliente, updateCliente } from "../repository/clientesRepository";

const route = Router();


route.get('/clientes', async (req, res) => {
    try {
        const listaClientes = await buscarClientes();

        return res.status(200).json({
            message: "Lista de clientes",
            listaClientes: listaClientes
        });

    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }
})

route.get('/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const cliente = await buscarClientesPorId(Number(id));

        return res.status(200).json({
            message: "Cliente encontrado",
            cliente: cliente
        });

    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }
})

route.post('/clientes', async (req, res) =>{
    try {
        const {nomeCliente, cpf, email, dataCadastro, telefone} = req.body;
        const novoCliente = await adicionarCliente(nomeCliente,cpf,email,dataCadastro,telefone);

        return res.status(201).json({
            message: "Cliente cadastrado com sucesso",
            cliente: novoCliente
        });

    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }
})

route.put('/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const clienteAtualizado = await updateCliente(Number(id), req.body);

        return res.status(200).json({
            message: "Cliente atualizado com sucesso",
            clienteAtualizado: clienteAtualizado
        });

    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }
})

route.delete('/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await deleteCliente(Number(id));

        return res.status(200).json({
            message: "Cliente deletado com sucesso",
            resultado: resultado
        });

    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }

})

export default route;


