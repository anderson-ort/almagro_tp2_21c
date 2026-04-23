import { Router } from "express"
import { chatController } from "../controllers/chat.controller.js"


const router = Router()


router.post("/chat", chatController)


export { router as chatRouter }