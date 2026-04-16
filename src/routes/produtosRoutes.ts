import { Router } from "express";
import { prisma } from "../lib/prisma";
import { empty } from "@prisma/client/runtime/library";

const route = Router();

route.get('/produtos', async (req, res) => {
    const listaProdutos = await prisma.produto.findMany();

    if(listaProdutos.length === 0 ){
        res.json(
            {
                message: "Não há produtos cadastrados ainda",
                cod: 404
            }
        )
    }

    res.json(listaProdutos);
})

route.get('/produtos/:id', async (req, res) => {
    const { id }  = req.params;

    const produto  = await prisma.produto.findUnique({
        where: {
            id: Number(id)
        }
    });

    if(!produto){
        res.json({
            message: "Produto não foi encontrado",
            cod: 404
        })
    }

    res.json({
        produto : produto,
        message : "Retorno somente de um produto",
        cod : 200
    })

});

//EMMANUEL - REALIZANDO POST EM PRDODUTOS
route.post('/produtoss', async (req, res) =>{
    try{
        const {nomeProduto,codigo, preco, id, categoriaId, estoque} = req.body;
         if(!nomeProduto && !codigo && !preco  && !categoriaId && !estoque){
            return res.json({
                message: "Falta um parâmetro para a criação de produto",
                cod: 400
            })
         }

         if(preco <= 0){
            return res.json({
                message: "Preço não pode ser 0",
                cod: 400
            })
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

    } catch(ex){
        res.json({
            message : "Erro na hora de fazer a requisição para a Api",
            cod: 500
        })
    }
});


export default route;