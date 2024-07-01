import {Router} from 'express';

const router = Router();
import { jwtVerify} from '../middlewares/auth.middleware.js';
import { 
        toggleToSubscription,
        getUserChannelSubscribers,
        getSubscribedChannels
 } from '../controllers/subscription.controller.js';

 router.use(jwtVerify);
 router.route("/toggleToSubscription/c/:channelId").post(toggleToSubscription);   
 router.route("/getUserChannelSubscribers/c/:channelId").get(getUserChannelSubscribers)
 router.route("/getSubscribedChannels").get(getSubscribedChannels);

export default router;