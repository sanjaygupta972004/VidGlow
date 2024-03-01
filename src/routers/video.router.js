import { Router } from 'express';

const router = Router();

import {jwtVerify} from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

import {
   publishVideo,
   isPublishVideo,
   getAllVideos,
   getVideoById,
   getUserVideos,
   updateTitleOrDescriptionVideo,
   updateThumbnailVideo,
   deleteVideo
} from '../controllers/video.controller.js';

router.use(jwtVerify);

router.route('/publishVideo').post(upload.single("videoFile"), publishVideo);
router.route('/isPublishVideo/c/:videoId').get(isPublishVideo);
router.route('/getAllVideos').get(getAllVideos);
router.route('/c/:videoId').get(getVideoById);
router.route('/getUserVideos').get(getUserVideos);
router.route('/updateVideoThumbnail/:videoId').patch(upload.single("thumbnail"),updateThumbnailVideo)
router.route('/updateVideoDetails/:videoId').patch(updateTitleOrDescriptionVideo)
router.route('/deleteVideo/:videoId').delete(deleteVideo)


export default router;  