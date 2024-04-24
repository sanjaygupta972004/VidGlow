import { Router } from "express";

const router = Router()
import { jwtVerify } from "../middlewares/auth.middleware.js"
router.use(jwtVerify)


export default router