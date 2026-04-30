
import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()


const users = [
    { userId: "user_1", userName: "pepe", password: "123" }]


router.post("/login", (request, response) => {
    const { userName, password } = request.body.user

    const user = users.find(user => user.userName === userName && user.password === password)

    const token = jwt.sign({ userId: user.userId }, "supersecreto_minimo_32_caracteres_aqui", { expiresIn: '1h' })

    response.status(200).json({
        ok: true,
        token,
        message: "usuario creado"
    })

})


export { router as authRouter }