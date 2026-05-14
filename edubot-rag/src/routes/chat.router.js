import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";

const router = Router();

/*
 *#swagger.tags = ['Chat']
 *#swagger.summary = 'Enviar prompt al chat'
 *#swagger.description = 'Genera una respuesta usando IA'
 *
 *#swagger.security = [{
 *    "bearerAuth": []
 *}]
 *
 *#swagger.parameters['body'] = {
 *    in: 'body',
 *    required: true,
 *    schema: {
 *        prompt: 'Hola IA'
 *    }
 *}
 *
 *#swagger.responses[200] = {
 *    description: 'Respuesta generada',
 *    schema: {
 *        respuesta: 'Hola humano'
 *    }
 *}
 **/
router.post("/chat", chatController);

export { router as chatRouter };
