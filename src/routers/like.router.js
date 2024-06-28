import { Router } from "express";

const router = Router()
import { jwtVerify } from "../middlewares/auth.middleware.js"
import { 
        toggleVideoLike,
        toggleCommentLike,
        toggleTweetLike,

} from "../controllers/like.controller.js"
router.use(jwtVerify)


router.route("/toggleToVideoLike/c/:videoId").get(toggleVideoLike)
router.route("/toggleToCommentLike/c/:commentId").get(toggleCommentLike)
router.route("/toggleToTweetLike/c/:tweetId").get(toggleTweetLike)

export default router;