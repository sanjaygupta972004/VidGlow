import { Router } from 'express';

const router = Router();

import {jwtVerify} from '../middlewares/auth.middleware.js';

router.use(jwtVerify);

import {
      createPlaylist,
      addVideoToPlaylist,
      removeVideoFromPlaylist,
      getAllPlaylists,
      getPlaylistById,
      updatePlaylist,
      deletePlaylist

} from "../controllers/playlist.controllers.js";


router.route("/createPlaylist").post(createPlaylist);
router.route("/addVideoToPlaylist/:playlistId/addVideo/:videoId").patch(addVideoToPlaylist)
router.route("/getAllPlaylists").get(getAllPlaylists);
router.route("/getPlaylistById/c/:playlistId").get(getPlaylistById);
router.route("/updatePlaylist/c/:playlistId").patch(updatePlaylist)
router.route("/removeVideoFromPlaylist/:playlistId/removeVideo/:videoId").patch(removeVideoFromPlaylist)
router.route("/deletePlaylist/c/:playlistId").delete(deletePlaylist)


export default router;  