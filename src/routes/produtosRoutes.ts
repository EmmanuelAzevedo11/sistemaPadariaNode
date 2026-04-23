import { Router } from "express";
import { prisma } from "../lib/prisma";
import { empty } from "@prisma/client/runtime/library";
import { connect } from "node:http2";
import { buscarProdutoPorId, buscarProdutos, criarProduto, deleteProduto, updateProduto } from "../repository/produtosRepository";

const route = Router();

route.get('/produtos', async (req, res) => {
    try {
        const listaProdutos = await buscarProdutos();
        return res.json(listaProdutos);
    } catch (error: any) {
        return res.status(404).json({
            message: error.message,
            cod: 404
        });
    }
});

//EMMANUEL - REALIZANDO GET EM APENAS UM PRODUTO
route.get('/produtos/:id', async (req, res) => {
    try{

        const { id }  = req.params;

        const produto = await buscarProdutoPorId(id);

        return res.json({
            produto : produto,
            message : "Retorno somente de um produto",
            cod : 200
        })

    } catch(error: any){
        return res.status(404).json({
            message: error.message,
            cod: 404
        });
    }
    

});

//EMMANUEL - REALIZANDO POST EM PRDODUTOS
route.post('/produtos', async (req, res) =>{
    try{
        const {nomeProduto,codigo, preco, categoriaId, estoque} = req.body;
        
        const novoProduto = criarProduto(nomeProduto,codigo,preco,categoriaId,estoque);

        return res.status(201).json(novoProduto);

    } catch(error: any){
        res.json({
            message : error.message,
            cod: 500
        })
    }
});

//EMMANUEL - REALIZANDO UPDATE EM PRODUTOS
route.put('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const produtoAtualizado = await updateProduto(Number(id), req.body);

        return res.status(200).json({
            message: "Produto atualizado com sucesso!",
            produto: produtoAtualizado
        });

    } catch (ex: any) {
        if (ex.message === "Produto não encontrado para atualização") {
            return res.status(404).json({ message: ex.message });
        }

        console.log(ex);
        return res.status(500).json({
            message: "Erro ao tentar atualizar o produto"
        });
    }
})

route.delete('/produtos/:id', async (req, res) => {
    try{
        const { id } = req.params;

        const produtoDeletado = await deleteProduto(id)
    
        return res.status(200).json({
            message: "Produto deletado com sucesso"
        });

    } catch(ex: any){
         if (ex.message === "Produto não encontrado para atualização") {
            return res.status(404).json({ message: ex.message });
        }

        console.log(ex);
        return res.status(500).json({
            message: "Erro ao tentar atualizar o produto"
        });
    }
})


export default route;