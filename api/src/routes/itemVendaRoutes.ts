import { Router } from "express";
import { adicionarItemVenda, buscarItensPorVenda, removerItemVenda } from "../repository/itemVendasRepository";

const route = Router();

route.get('/itemVenda/:id', async (req,res) => {
    try {
        const { id } = req.params;
        const itens = await buscarItensPorVenda(Number(id));

        return res.status(200).json({
            message: "Itens encontrados com sucesso",
            itens: itens
        });
    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });    
    }
});

route.post('/itemVenda', async (req, res) => {
    try {
        const { vendaId, produtoId, quantidade, precoUnitario} = req.body;

        const itemAdicionado = await adicionarItemVenda(Number(vendaId), Number(produtoId), Number(quantidade),  Number(precoUnitario));

        return res.status(201).json({
            message: "Item adicionado com sucesso",
            itemAdicionado: itemAdicionado
        });

    } catch (error: any) {
        return res.status(422).json({
            message: error.message
        });
    }
});

route.delete('/itemVenda/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await removerItemVenda(Number(id));

        return res.status(200).json({
            message: "Item deletado da venda",
            resultado: resultado
        });
    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }
})


export default route;

