import { Router } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/user.schema.js";

const router = Router();

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
router.post("/login", async (request, response) => {
    const { email, password } = request.body;

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
        return response.status(401).json({
            ok: false,
            message: "credenciales invalidas",
        });
    }

    const token = jwt.sign({ userId: user._id }, config.jwtTokenSecret, {
        expiresIn: "1h",
    });

    response.status(200).json({
        ok: true,
        token,
        message: "usuario creado",
    });
});

router.post("/register", async (request, response) => {
    const { email, password } = request.body.user;
    const user = await User.create({ email, password });

    response.status(200).json({
        ok: true,
        userId: user._id,
        message: "usuario creado",
    });
});

export { router as authRouter };
