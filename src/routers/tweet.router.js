import {Router} from 'express';

const router = Router();

import {jwtVerify} from '../middlewares/auth.middleware.js';
import {
   createTweet,
   getUserTweets,
   getTweets,
   updateTweet,
   deleteTweet,
} from '../controllers/tweet.controller.js';   

router.use(jwtVerify);

router.route('/').post(createTweet);
router.route('/userTweets').get(getUserTweets);
router.route('/tweets').get(getTweets);
router.route('/c/:tweetId').patch(updateTweet).delete(deleteTweet);



export default router;