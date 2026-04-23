import { Router } from "express";
import { prisma } from "../lib/prisma";
import { empty } from "@prisma/client/runtime/library";
import { connect } from "node:http2";
import { buscarFormaPagamentoPorId, buscarTodasFormasDePagamento, criarFormaPagamento, deleteFormaPagamento, updateFormaPagamento } from "../repository/formaPagamentoRepository";

const route = Router();

route.get('/formaPagamento', async (req, res) => {
    try {
        const listaFormaPagamentos = await buscarTodasFormasDePagamento();

        return res.status(200).json({
            message: "Formas de pagamento encontradas",
            listaFormaPagamentos: listaFormaPagamentos
        });

    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }
});

route.get('/formaPagamento/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const formaPagamento = await buscarFormaPagamentoPorId(Number(id));

        return res.status(200).json({
            message: "Forma de pagamento encontrada com sucesso",
            formaPagamento: formaPagamento
        });
    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }
});

route.post('/formaPagamento', async (req, res) => {
    try {
        const {nome} = req.body;
        const formaPagamentoCadastrada = await criarFormaPagamento(nome);

        return res.status(200).json({
            message: "Forma de pagamento criada com sucesso",
            formaDePagamento: formaPagamentoCadastrada
        });
        
    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }
});

route.put('/formaPagamento/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const formaPagamentoAtualizada = await updateFormaPagamento(Number(id), req.body);

        return res.status(200).json({
            message: "Forma de pagamento atualizada com sucesso",
            formaPagamentoAtualizada: formaPagamentoAtualizada
        });

    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }
});

route.delete('/formaPagamento/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const formaPagamentoDeletada = await deleteFormaPagamento(Number(id));
       
        return res.status(200).json({
            message: "Forma de pagamento deletada com sucesso",
            formaPagamentoDeletada: formaPagamentoDeletada
        });
        
    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }
})




export default route;