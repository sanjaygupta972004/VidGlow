import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const crateVideoComment = asyncHandler(async(req,res)=> {
   const {content} = req.body
   const {videoId} = req.params
   const owner = req.user?._id
   
   if(!content){
      throw new ApiError(400, "content is required")
   }

   if(!isValidObjectId(videoId)){
      throw new ApiError(400, "invalid videoId")
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
      throw new ApiError(404, "video is not available to comment on it")
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

const updateVideoComment = asyncHandler(async(req,res)=> {
   const{content} = req.body
   const {commentId} = req.params
   const owner = req.user?._id

   if(!isValidObjectId(commentId)){
      throw new ApiError(400,"invalid commentId")
   }

   if(!content){
      throw new ApiError(400,"content is required to updateComment")
   }

   const exitingComment  = await Comment.findById(commentId)

   if(!exitingComment){
      throw new ApiError(404,"this comment is not available to updating")
   }
   if(exitingComment.owner.toString() !== owner.toString()){
      throw new ApiError(403,"you are not authorized to updateComment")
   }

   const updatedComment = await Comment.findByIdAndUpdate(commentId,
      {
         content:content
      },
      {
         new:true
      }
   )
   
   if(!updatedComment){
      throw new ApiError(500, "something went to wrong while updating comment")
   }

   return res 
        .status(200)
        .json(new ApiResponse(200,updatedComment,"updated comment successfully"))

})


const deleteVideoComment = asyncHandler(async(req,res)=> {
   const {commentId} = req.params
   const owner = req.user?._id

   if(!isValidObjectId(commentId)){
      throw new ApiError(400,"invalid commentId")
   }


   const exitingComment  = await Comment.findById(commentId)


   if(!exitingComment){
      throw new ApiError(404,"this comment is not available for deleting")
   }
   if(exitingComment.owner.toString() !== owner.toString()){
      throw new ApiError(403,"you are not authorized to deleteComment")
   }

   const result = await Comment.findByIdAndDelete(commentId)
   
   if(!result){
      throw new ApiError(500, "something went to wrong while deleting comment")
   }

   return res 
        .status(200)
        .json(new ApiResponse(200,{},"updated comment successfully"))

})

const getAllVideoComments = asyncHandler(async (req, res) => {
   const { videoId } = req.params;
   const { page = 1, limit = 10 } = req.query;
 
   if (!isValidObjectId(videoId)) {
     throw new ApiError(403, "videoId is not valid");
   }
   
   const parseLimit = parseInt(limit,10);
   const parsePage = parseInt(page,10);
   const pageSkip = (parsePage - 1) * parseLimit;

   const directionOfSort = { createdAt: -1 };
   const options = {
     page: parsePage,
     limit: parseLimit,
     customLabels: {
       docs: "comments",
       totalDocs: "totalComments"
     }
   };

   const aggregate = Comment.aggregate([
     {
       $match: {
         video: new mongoose.Types.ObjectId(videoId)
       }
     },
     {
       $lookup: {
         from: "users",
         localField: "owner",
         foreignField: "_id",
         as: "owner"
       }
     },
     {
       $unwind: {
         path: "$owner",
         preserveNullAndEmptyArrays: true
       }
     },
     {
       $sort: directionOfSort
     },
     {
       $skip: pageSkip
     },
     {
       $limit: parseLimit
     },
     {
       $project: {
         content: 1,
         owner: {
           _id: 1,
           username: 1,
           avatar: 1
         },
         createdAt: 1
       }
     }
   ]);
 
   const comments = await Comment.aggregatePaginate(aggregate, options);
 
   if (!comments) {
     throw new ApiError(500, "Something went wrong while fetching comments");
   }
 
   return res
     .status(200)
     .json(new ApiResponse(200, comments, "Fetched allVideoComments successfully"));
 });


 

const getVideoCommentById = asyncHandler(async (req, res) => {
   const { commentId } = req.params
   if (!isValidObjectId(commentId)) {
      throw new ApiError(403, "commentId is not valid")
   }

   const comment = await Comment.findById(commentId)
   if (!comment) {
      throw new ApiError(500,"Something wrong while fetching comment")
   }

    return res
      .status(200)
      .json(new ApiResponse(200,comment,"Fetched videoComment successfully"))
}) 





export {
   crateVideoComment,
   updateVideoComment,
   deleteVideoComment,
   getAllVideoComments,
   getVideoCommentById
}