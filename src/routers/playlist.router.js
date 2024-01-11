import { Router } from 'express';

const router = Router();

import {jwtVerify} from '../middlewares/auth.middleware.js';

router.use(jwtVerify);

import {
      createPlaylist,
      addVideoToPlaylist,
} from "../controllers/playlist.controllers.js";


router.route("/createPlaylist").post(createPlaylist);
router.route("/:playlistId/addVideo/:videoId").patch(addVideoToPlaylist); 




export default router;  