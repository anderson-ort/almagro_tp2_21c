import { Router } from "express";
import { historyDeleteAllController, historyDeleteOneController, historyGetAllController } from "../controllers/history.controller.js";

const router = Router()

//mostrar todos los chats guardados
router.get("/history", historyGetAllController)
// borrar 1 chat en particular que lo busco por id
router.delete("/history/:chatId", historyDeleteOneController)
// borrar todos los chat historicos
router.delete("/history", historyDeleteAllController)


export { router as historyRouter }
