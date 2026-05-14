import { Router } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

const router = Router();

const users = [{ userId: "user_1", userName: "pepe", password: "123" }];

/*
 * #swagger.tags = ['Auth']
 * #swagger.summary = 'Login de usuario'
 * #swagger.description = 'Genera un JWT para autenticacion'
 *
 * #swagger.requestBody = {
 *    required: true,
 *    content: {
 *       "application/json": {
 *          schema: {
 *             type: "object",
 *             properties: {
 *                user: {
 *                   type: "object",
 *                   properties: {
 *                      userName: {
 *                         type: "string",
 *                         example: "pepe"
 *                      },
 *                      password: {
 *                         type: "string",
 *                         example: "123"
 *                      }
 *                   }
 *                }
 *             }
 *          }
 *       }
 *    }
 * }
 */
router.post("/login", (request, response) => {
    const { userName, password } = request.body.user;

    const user = users.find(
        (user) => user.userName === userName && user.password === password,
    );

    const token = jwt.sign({ userId: user.userId }, config.jwtTokenSecret, {
        expiresIn: "1h",
    });

    response.status(200).json({
        ok: true,
        token,
        message: "usuario creado",
    });
});

export { router as authRouter };
