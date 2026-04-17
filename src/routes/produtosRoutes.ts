import { Router } from "express";
import { prisma } from "../lib/prisma";
import { empty } from "@prisma/client/runtime/library";
import { connect } from "node:http2";

const route = Router();

route.get('/produtos', async (req, res) => {
    const listaProdutos = await prisma.produto.findMany();

    

    if(listaProdutos.length === 0 ){
        return res.json(
            {
                message: "Não há produtos cadastrados ainda",
                cod: 404
            }
        )
    }

    return res.json(listaProdutos);
})

//EMMANUEL - REALIZANDO GET EM APENAS UM PRODUTO
route.get('/produtos/:id', async (req, res) => {
    const { id }  = req.params;

    const produto  = await prisma.produto.findUnique({
        where: {
            id: Number(id)
        }
    });

    if(!produto){
        return res.json({
            message: "Produto não foi encontrado",
            cod: 404
        })
    }

    return res.json({
        produto : produto,
        message : "Retorno somente de um produto",
        cod : 200
    })

});

//EMMANUEL - REALIZANDO POST EM PRDODUTOS
route.post('/produtos', async (req, res) =>{
    try{
        const {nomeProduto,codigo, preco, categoriaId, estoque} = req.body;
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

         return res.status(201).json(novoProduto);

    } catch(ex){
        res.json({
            message : "Erro na hora de fazer a requisição para a Api",
            cod: 500
        })
    }
});

//EMMANUEL - REALIZANDO UPDATE EM PRODUTOS
route.put('/produtos/:id', async(req, res) => {
    try{
        const { id } = req.params;
        const {nomeProduto,codigo, preco, categoriaId, estoque } = req.body;
        
        if(!nomeProduto && !codigo && !preco && !categoriaId && !estoque){
           return res.status(400).json({ 
                message: "Não foram recebidos parâmetros para fazer o update"
            });
        } 
        
        if(preco <= 0){
            return res.status(400).json({
                message: "Preço não pode ser igual ou menor que 0"
            });
        }

        const produtoAtualizado = await prisma.produto.update({
            where: {
                id: Number(id)
            },
            data: {
                nomeProduto,
                codigo,
                preco,
                estoque,
                categoria: categoriaId ? { connect: { id: Number(categoriaId) } } : undefined
            }
        });

        return res.status(200).json(produtoAtualizado);

    } catch(ex: any){
        console.log(ex);
        return res.status(500).json({
            message: "erro ao conectar com o servidor"
        })    
    }
});

route.delete('/produtos/:id', async (req, res) => {
    try{
        const { id } = req.params;

        if(!id){
            res.status(404).json({
                message: "Produto não encontrado"
            })
        }

        await prisma.produto.delete({
            where: {
                id: Number(id)
            }
        });

    
        return res.status(200).json({
            message: "Produto deletado com sucesso"
        })
    } catch(ex: any){
        console.log(ex);

        res.status(500).json({
            message: "Falha ao conectar com o servidor"
        })
    }
})


export default route;