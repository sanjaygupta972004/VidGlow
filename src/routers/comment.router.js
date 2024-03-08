import { Router } from "express";

const router = Router()
import  {jwtVerify} from "../middlewares/auth.middleware.js"

import {
    crateVideoComment,
    updateVideoComment,
    deleteVideoComment,
 } from "../controllers/comment.controllers.js";

router.use(jwtVerify)

router.route("/createcomment/c/:videoId").post(crateVideoComment)
router.route("/updateComment/c/:commentId").patch(updateVideoComment)
router.route("/deleteComment/c/:commentId").delete(deleteVideoComment)


export default router