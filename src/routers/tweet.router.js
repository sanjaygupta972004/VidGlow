import {Router} from 'express';

const router = Router();

import {jwtVerify} from '../middlewares/auth.middleware.js';
import {
   createTweet,
   getUserTweets,
   getAllTweets,
   getTweetById,
   updateTweet,
   deleteTweet,
} from '../controllers/tweet.controller.js';   

router.use(jwtVerify);

router.route('/createTweet').post(createTweet);
router.route('/getUserTweets').get(getUserTweets);
router.route('/getAllTweets').get(getAllTweets);
router.route('/getTweetById/c/:tweetId').get(getTweetById);
router.route('/updateTweet/c/:tweetId').patch(updateTweet);
router.route('/deleteTweet/c/:tweetId').delete(deleteTweet);



export default router;