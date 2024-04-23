import { Router } from "express";

const router = Router()
import  {jwtVerify} from "../middlewares/auth.middleware.js"

import {
    crateVideoComment,
    getAllVideoComments,
    updateVideoComment,
    deleteVideoComment,
    getVideoCommentById
 } from "../controllers/comment.controllers.js";

router.use(jwtVerify)

router.route("/createComment/c/:videoId").post(crateVideoComment)
router.route("/getAllVideoComments/c/:videoId").get(getAllVideoComments)
router.route("/updateComment/c/:commentId").patch(updateVideoComment)
router.route("/deleteComment/c/:commentId").delete(deleteVideoComment)
router.route("/getVideoCommentById/c/:commentId").get(getVideoCommentById)



export default router