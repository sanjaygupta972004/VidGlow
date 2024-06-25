import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { isValidObjectId } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
   const { videoId } = req.params;
   const likedBy = req.user?._id;
   if(!isValidObjectId(videoId)){
        throw new ApiError(400, "invalid videoId");
        }    
   const oldLike = await Like.findOne({
        $and: [
           {
                video: videoId,
                likedBy: likedBy,
           },
        ],
   })
 
  if(oldLike){
        throw new ApiError(403,"You have Already liked this video")
  }

  const toggleLike = await Like.create({
        video:videoId,
        likedBy:likedBy
  })

  if(!toggleLike){
        throw new ApiError(500,"Something went wrong while liking video ")
  }

  return res
       .status(200)
       .json(new ApiResponse(200,toggleLike,"video liked successfully"))

});


const toggleCommentLike = asyncHandler(async(req,res)={

})

const toggleTweetLike = asyncHandler(async(req,res)={

})


export {
        toggleCommentLike,
        toggleTweetLike,
        toggleTweetLike
}