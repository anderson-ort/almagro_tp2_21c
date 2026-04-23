import { Router } from 'express'
import { pokemonProxy } from '../controllers/proxy.controller.js'


const router = Router()

router.get("/pokemon/:endpoint", pokemonProxy)

export { router as proxyRouter }
