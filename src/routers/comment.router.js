import { Router } from "express";

const router = Router()
import  {jwtVerify} from "../middlewares/auth.middleware.js"

import { crateVideoComment } from "../controllers/comment.controllers.js";

router.use(jwtVerify)

router.route("/createcomment/c/:videoId").post(crateVideoComment)


export default router