import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
   const { name, description } = req.body;
   const owner = req.user._id;

   if (!name || !description) {
      throw new ApiError(400, "Please provide all required fields");
   }

   if(!owner){
      throw new ApiError(401, "unauthorized user");
   }

   const playlist = await Playlist.create(
      {
         name, 
         description,
         owner 
         }
      );

   if (!playlist) {
      throw new ApiError(500, "Something went wrong while creating playlist");
   }

   return res
      .status(201)
      .json(new ApiResponse(201,  playlist, "Playlist created successfully"));
})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
   const {playlistId, videoId} = req.params;
   const owner = req.user._id;

   console.log(playlistId, videoId);

   if(!playlistId &&!videoId){
      throw new ApiError(400, "Please provide all required fields");
   }


   const playlist = await Playlist.findById(playlistId);

   if(!playlist){
      throw new ApiError(404, "Playlist not found");
   }  


   if(playlist.owner.toString() !== owner.toString()){
      throw new ApiError(401, "unauthorized user");
   }

   if(playlist.videos.includes(videoId)){
      throw new ApiError(400, "Video already in playlist");
   }



   const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
       {$push: {videos: videoId}},
        {new: true}
       );

   if(!updatedPlaylist) {
      throw new ApiError(500, "Something went wrong while updating playlist");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"));
  

})


const deleteVideoFromPlaylist = asyncHandler(async (req, res) =>  {
   const {playlistId,videoId} = req.params;
   const owner = req.user._id;

   if(!playlistId &&!videoId){
      throw new ApiError(400, "Please provide playlistId and videoId");
   }

   const playlist = await Playlist.findById(playlistId);

   if(playlist.owner.toString() !== owner.toString()){
      throw new ApiError(401, "unauthorized user");
   }

   if(!playlist.videos.includes(videoId)){
      throw new ApiError(400, "Video not in playlist");
   }


   const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
      {$pull: {videos: videoId}},
       {new: true}
      );

   if(!updatedPlaylist) {
      throw new ApiError(500, "Something went wrong while updating playlist");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, updatedPlaylist, "Video deleted from playlist successfully"));


})


const getUserPlaylists = asyncHandler(async (req, res) => {
   const owner = req.user._id;

   if(!owner){
      throw new ApiError(401, "unauthorized user");
   }

   const playlists = await Playlist.find({owner}).populate("videos"); 

   if(!playlists) {
      throw new ApiError(500, "Something went wrong while fetching playlists");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, playlists, "Playlists fetched successfully"))

})


const getPlaylistById = asyncHandler(async (req, res) => {
  
   const {playlistId} = req.params;

   if(!playlistId){
   throw new ApiError(400, "Please provide playlistId");
  }

  const playlist = await Playlist.findById(playlistId).populate("videos");
 
   if(!playlist) {
   throw new ApiError(500, "Something went wrong while fetching playlist");
  }

   return res
     .status(200)
     .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))

   })

export {
   createPlaylist,
   addVideoToPlaylist,
   deleteVideoFromPlaylist,
   getUserPlaylists,
   getPlaylistById

}
