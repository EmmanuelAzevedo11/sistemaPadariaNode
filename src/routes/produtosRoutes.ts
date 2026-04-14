import { Router } from "express";

const route = Router();

route.get('/produtos', (req, res) => {
    res.json({
        message : 'rotas de produtos'
    })
})


export default route;