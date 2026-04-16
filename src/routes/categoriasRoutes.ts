import { Router } from "express";
import { prisma } from "../lib/prisma";
import { empty } from "@prisma/client/runtime/library";

const route = Router();

route.get('/categorias', async (req, res) => {
    try {
        const listaCategorias = await prisma.categoria.findMany();

        if(listaCategorias.length === 0){
            return res.status(404).json({
                message: "Ainda não há categorias registradas",
            });
        }

        return res.status(200).json({
            message: "Lista de categorias encontrada com sucesso",
            categorias: listaCategorias            
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "A aplicação não conseguiu conectar com o servidor"
        });
    }
});

route.get('/categorias/:id', async (req,res) => {
    try{
         const { id } = await req.params;

        const { categoria } = await prisma.categoria.findUnique({
            where: {
                id: Number(id)
            }
        });

        if(!categoria){
            return res.status(404).json({
                message: "Categoria não encontrada"
            });
        } 
        
        return res.status(200).json({
            message: "Categoria encontrada",
            categoria: categoria
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            message: "A aplicação não conseguiu conectar com o servidor"
        });
    }
});

route.post('/categorias', async (req, res) => {
    try{
        const {nomeCategoria, descricao} = req.body;

        if(!nomeCategoria || !descricao){
            return res.status(422).json({
                message: "Faltam atributos para criação da categoria"
            });
        }

        if(nomeCategoria.length <= 5 && descricao.length <= 5){
            return res.status(422).json({
                message: "Categoria ou descrição estão pequenas demais"
            });
        }

        const categoria =  await prisma.categoria.create({
            data: {
                nomeCategoria,
                descricao
            },
        });

        return res.status(200).json({
            message: "Categoria criada com sucesso",
            categoria: categoria
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({
            message: "A aplicação não conseguiu conectar com o servidor"
        });
    }
});

route.put('/produtos/:id', async (req, res) => {
    try {
        const { id } = await req.params;
        const {nomeCategoria, descricao} = await req.body;

        if(!nomeCategoria && !descricao){
            return res.status(422).json({
                message: "Faltaram parâmetros",
            });
        }
        
        if(nomeCategoria.length < 5 || descricao.length < 5){
            return res.status(422).json({
                message: "Nome ou descrição estão pequenos"
            });
        }
        
        const categoriaAtualizada = await prisma.categoria.update({
            where: {id: Number(id) },
            data: {
                nomeCategoria,
                descricao
            }
        })

        return res.status(200).json({
            message: "Categoria atualizado com sucesso",
            categoria: categoriaAtualizada
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "A aplicação não conseguiu conectar com o servidor"
        });
    }
});

route.delete('/produtos/:id', async (req, res) => {
    try{
        const { id } = await req.params;

        if(!id){
            return res.status(400).json({
                message: "Produto não encontrado"
            });
        }

        const { categoriaDeletada } = await prisma.categoria.delete({
            where: {
                id: Number(id)
            }
        });

        return res.status(200).json({
            message: "Categoria deletada com sucesso",
            categoria: categoriaDeletada
        });
    } catch(error){
        console.log(error);
        res.status(500).json({
            message: "A aplicação não conseguiu conectar com o servidor"
        });
    }


    
})

export default route;