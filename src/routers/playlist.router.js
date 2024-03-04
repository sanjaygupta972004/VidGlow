import { Router } from 'express';

const router = Router();

import {jwtVerify} from '../middlewares/auth.middleware.js';

router.use(jwtVerify);

import {
      createPlaylist,
      addVideoToPlaylist,
      deleteVideoFromPlaylist,
      getUserPlaylists,
      getPlaylistById,
      deletePlaylist

} from "../controllers/playlist.controllers.js";


router.route("/createPlaylist").post(createPlaylist);
router.route("/:playlistId/addVideo/:videoId").patch(addVideoToPlaylist)
router.route("/getUserPlaylists").get(getUserPlaylists);
router.route("/c/:playlistId").get(getPlaylistById);
router.route("/:playlistId/deleteVideo/:videoId").patch(deleteVideoFromPlaylist)
router.route("/c/:playlistId").delete(deletePlaylist)




export default router;  