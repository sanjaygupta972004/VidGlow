import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { isValidObjectId } from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
   const { name, description } = req.body;
   const owner = req.user._id;

   if (!name || !description) {
      throw new ApiError(400, "Please provide all required fields");
   }

   const playlistExist = await Playlist.findOne({
      name,
      owner
   });

   if(playlistExist){
      throw new ApiError(400, "playlist with this name already exist");
   }

   if(!owner){
      throw new ApiError(401, "you are not authorized to create a playlist");
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

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
      throw new ApiError(400, "Invalid playlistId or videoId");
    }

   if(!playlistId &&!videoId){
      throw new ApiError(400, "Please provide  playlistId and videoId");
   }


   const playlist = await Playlist.findById(playlistId);

   if(!playlist){
      throw new ApiError(404, "given playlistId of playlist is not available in database pls create playlist first"); 
   }  


   if(playlist.owner.toString() !== owner.toString()){
      throw new ApiError(401, "you are not authorized add video in playlist");
   }

   if(playlist.videos.includes(videoId)){
      throw new ApiError(400, "Video already exit in playlist");
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


const removeVideoFromPlaylist = asyncHandler(async (req, res) =>  {
   const {playlistId,videoId} = req.params;
   const owner = req.user._id;

   if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
      throw new ApiError(400, "Invalid playlistId or videoId");
   }
   if(!playlistId &&!videoId){
      throw new ApiError(400, "Please provide playlistId and videoId");
   }

   const playlist = await Playlist.findById(playlistId);
   if(!playlist){
      throw new ApiError(404, "Playlist is not available in database pls create playlist first then add video in it");
   }

   if(playlist.owner.toString() !== owner.toString()){
      throw new ApiError(401, " you are not authorized to delete video");
   }

   if(!playlist.videos.includes(videoId)){
      throw new ApiError(400, "Video is not available in playlist");
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


const getAllPlaylists = asyncHandler(async (req, res) => {
   const owner = req.user._id;

   if(!owner){
      throw new ApiError(401, "unauthorized user");
   }

   const playlists = await Playlist.find({owner}).populate("videos", "-updatedAt -createdAt"); 

   if(!playlists) {
      throw new ApiError(500, "Something went wrong while fetching playlists");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, playlists, "Playlists fetched successfully"))

})


const getPlaylistById = asyncHandler(async (req, res) => {
  
   const {playlistId} = req.params;

   if(!isValidObjectId(playlistId)){
   throw new ApiError(400, "invalid playlistId");
  }

  const playlist = await Playlist.findById(playlistId).populate("videos");
   
  if(playlist === null){
   throw new ApiError(500,"playlist is not available")
  }
 
   if(!playlist) {
   throw new ApiError(500, "Something went wrong while fetching playlist");
  }

   return res
     .status(200)
     .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))

   })


const deletePlaylist = asyncHandler(async(req,res)=>{
   const {playlistId} = req.params

   if(!isValidObjectId(playlistId)){
      throw new ApiError(400,"playlistId invalid")
   }

   const playlist  = await Playlist.findById(playlistId)

   if(playlist.owner.toString()  !== req.user?._id.toString()){
      throw new ApiError(403 , " you are not authorized to delete playlist")
   }

    await Playlist.findByIdAndDelete(playlistId)

   return res
         .status(200)
         .json(new ApiResponse(200, {}, "playlist is delete successfully"))
})


const updatePlaylist = asyncHandler( async(req,res) => {
   const {name, description} = req.body
   const {playlistId} = req.params

   if(!isValidObjectId(playlistId)){
      throw new ApiError(400,"invalid playlistId")
   }

   if(!name || !description || name.trim() === "" || description.trim() === ""){
      throw new ApiError(400, "please provide title and description to update playlist")
   }

   const playlist = await Playlist.findOne({
      $or:[
         {name},
         {description}
      ]
   })

   if(playlist){
      throw new ApiError(400, "this playlist and description already exit")
   }

   const oldPlaylist = await Playlist.findById(playlistId)

   if(oldPlaylist.owner.toString() !== req.user?._id.toString()){
      throw new ApiError(403, "unauthorized user to update playlist")
   }

   const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
   {
      name,
      description
   },
   {
      new:true
   })

   if(!updatedPlaylist){
      throw new ApiError(500,"something went wrong while updating playlist")
   }

   return res
       .status(200)
       .json( new ApiResponse(200, updatedPlaylist, "updated playlist successfully"))
   
})

export {
   createPlaylist,
   addVideoToPlaylist,
   removeVideoFromPlaylist,
   getAllPlaylists,
   getPlaylistById,
   deletePlaylist,
   updatePlaylist  

}
