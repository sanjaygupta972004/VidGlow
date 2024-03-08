import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";

const crateVideoComment = asyncHandler(async(req,res)=> {
   const {content} = req.body
   const {videoId} = req.params
   const owner = req.user?._id
   
   if(!content){
      throw new ApiError(400, "content is required")
   }

   if(!isValidObjectId(videoId)){
      throw new ApiError(400, "invaild videoId")
   }

   const oldComment =  await Comment.find({
      $and:[{
         video:videoId,
         owner:owner
      }]
   })


    oldComment.map((comment)=>{
      if(comment.content === content){
         throw new ApiError(400,"this comment already exit pls send another comment")
      }
    })


   const video = await Video.findById(videoId)
   if(!video){
      throw new ApiError(404, "video is not available for comment")
   }

   const comment  = await Comment.create({
      content:content,
      video:videoId,
      owner:owner
   })

   if(!comment){
      throw new ApiError(500,"something went wrong while creating comment")
   }

   return res
      .status(201)
      .json(new ApiResponse(201,comment,"comment done"))

})


export {
   crateVideoComment
}