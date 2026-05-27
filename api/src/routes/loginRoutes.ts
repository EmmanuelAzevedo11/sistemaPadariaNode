import { Router } from "express";
import { autenticadorEmail } from "../service/login";

const route = Router();


route.post('/login', async (req, res) => {
    try {
        const {email, senha} = req.body;
        const dadosLogin = await autenticadorEmail(email, senha);
        
        return res.status(200).json({
            message: "Login realizado com sucesso",
            ...dadosLogin
        });
        
    } catch (error: any) {
        return res.status(401).json({ message: error.message });
    }
})


export default route;