import { Router } from 'express';

const router = Router();

import {jwtVerify} from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

import {
   publishVideo,
   getAllVideos,
   getVideoById,
   getUserVideos,
   updateVideo,
   deleteVideo
} from '../controllers/video.controller.js';

router.use(jwtVerify);

router.route('/publishVideo').post(upload.single("videoFile"), publishVideo);
router.route('/getAllVideos').get(getAllVideos);
router.route('/c/:videoId').get(getVideoById);
router.route('/getUserVideos').get(getUserVideos);
router.route('/updateVideo/:videoId').patch(upload.single("thumbnail"),updateVideo)
router.route('/deleteVideo/:videoId').delete(deleteVideo)


export default router;  