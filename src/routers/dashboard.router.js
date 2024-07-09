import { Router } from "express";

const router = Router();
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { getChannelVideos ,getChannelState} from "../controllers/dashboard.controller.js";

router.use(jwtVerify);

router.route("/getChannelVideos/c/:channelId").get(getChannelVideos);
router.route("/getChannelState/c/:channelId").get(getChannelState);

export default router; 