import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import { upLoadOnCloudinary, deleteFromCloudinary,getPublicId,  thumbnailUrl } from "../utils/cloudinary.js"
import { isValidObjectId } from "mongoose"
import mongoose from "mongoose"




const publishVideo = asyncHandler(async (req, res) => {


   const {title , description} = req.body

   if(!title && !description){
      throw new ApiError(400, "title and description are required")
   }

   const oldVideo = await Video.findOne({
      $or:[
         {title},
         {description}
      ]
   })

   if(oldVideo){
      throw new ApiError(400, "video already exists")
   }

   const localVideoUrl = req.file?.path 

  // console.log(localVideoUrl)  

   if(!localVideoUrl) {
      throw new ApiError(400, "video file is required")
   }

   const videoUrl = await upLoadOnCloudinary(localVideoUrl)


   if(!videoUrl){
      throw new ApiError(500, "something went wrong while uploading video")
   }

   //const thumbnailUrl =  videoUrl.url.replace("mp4", "png")

   const  clodinaryThumbnailUrl  =  await thumbnailUrl(videoUrl.url)

   if(!clodinaryThumbnailUrl){
      throw new ApiError(500, "error while generating thumbnail")
   }

   const owner = req.user?._id

  
   if(!isValidObjectId(owner)){
      throw new ApiError(400, "user is not valid to create video")
   
   }


   const video = await Video.create({
      title,
      description,
      videoFile: videoUrl.url,
      thumbnail: clodinaryThumbnailUrl,
      owner
   })

   if(!video){
      throw new ApiError(500, "something went wrong while creating video")
   }

   return res
      .status(201)
      .json(new ApiResponse(201,video,"video created successfully"))

})



const isPublishVideo = asyncHandler(async (req, res) => {
const {videoId} = req.params
const userId = req.user?._id


if(!isValidObjectId(videoId) ){
   throw new ApiError(400, "Invalid videoId ")
}

if(!(isValidObjectId(userId))){
   throw new ApiError(400, "Invalid userId")
}

const video = await Video.findById(videoId)

if(video.owner.toString() !== userId.toString()){
   throw new ApiError(401, "you are not authorized to publish this video")
}

video.isPublished ? video.isPublished =  false : video.isPublished = true

await video.save({
   validateBeforeSave:false
})

return res
     .status(200)
     .json(new ApiResponse(200,{},"video published successfully"))

})

const getAllVideos = asyncHandler(async (req, res) => {
   const { page = 1, limit = 10, query } = req.body;
   const userId = req.user?._id;

   if (isNaN(page) || isNaN(limit) || typeof query !== 'string') {
       throw new ApiError(400, "Invalid input parameters");
   }

   const skip = (page - 1) * limit;

   const sortParams = { createdAt: -1 };
   const options = {
       page: page,
       limit: limit,
       customLabels: {
           docs: 'videos',
           totalDocs: 'totalFetchVideo'
       },
   }

   const pipeline = [
       {
           $match: {
               $and: [
                   { owner: new mongoose.Types.ObjectId(userId) },
                   {
                       $or: [
                           { title: { $regex: query, $options: "i" } },
                           { description: { $regex: query, $options: "i" } }
                       ]
                   }
               ]
           }
       },
       {
           $lookup: {
               from: "likes",
               localField: "_id",
               foreignField: "video",
               as: "likes"
           }
       },
       {
           $addFields: {
               totalLikes: { $size: "$likes" }
           }
       },
       {
           $sort: sortParams
       },
       {
           $skip: skip
       },
       {
           $limit: limit
       },
       {
           $project: {
               title: 1,
               description: 1,
               videoFile: 1,
               thumbnail: 1,
               views: 1,
               owner: 1,
               totalLikes: 1,
           }
       }
   ];

   try {
       let videos = await Video.aggregatePaginate(pipeline, options);
       console.log(videos);

       if (!videos || videos.length === 0) {
           throw new ApiError(404, "Videos not found");
       }

       return res.status(200).json(new ApiResponse(200, videos, "Videos found successfully"));
   } catch (error) {
       console.error("Error occurred:", error);
       throw new ApiError(500, "Internal server error");
   }
});


//  required  some changes in this controllers
const getVideoById = asyncHandler(async (req, res) => {
   
   const {videoId} = req.params

   if(!isValidObjectId(videoId)){
      throw new ApiError(400, "Invalid video id")
   }
  const video = await Video.aggregate([

   {
     $match: {
       _id: new mongoose.Types.ObjectId(videoId)
     }
   },

   {
      $set: {
         views: { $add: [ "$views", 1 ] }
      }
   },
 

   {
     $lookup: {
       from: "comments",
       localField: "_id",
       foreignField: "video",
       as: "comments",
       pipeline: [
         {
           $lookup: {
             from: "users",
             localField: "owner",
             foreignField: "_id",
             as: "owner",
             pipeline : [
               {
                 $project: {
                   fullName: 1,
                   username: 1,
                   email: 1,
                   profileImage: 1
                 }
               }
             ]
           }
         },
         {
             $addFields: {
                owner: { $arrayElemAt: ["$owner", 0] }
             }
          },

       ]
     },

   },
   {
     $lookup: {
       from: "likes",
       localField: "_id",
       foreignField: "video",
       as: "likes"
     }
   },
   {
     $addFields: {
       totalLikes: { $size: "$likes" },
       totalComments: { $size: "$comments" },
     
     }
   },
  
   {
     $project: {
       title: 1,
       description: 1,
       videoFile: 1,
       thumbnail: 1,
       views: 1,
       owner: 1,
       totalLikes: 1,
       totalComments: 1,
       comments: 1,
       likes: 1,
     }
   }
 ]);

   const views = video[0].views

   const resVideo = video[0]
    

 const userId = req.user?._id

 if( resVideo.owner.toString() !== userId.toString()){
   
   await Video.findByIdAndUpdate(
      videoId, 
      {
      views: views 
    },
   {
      new: true
   }
   )
 }
 
 if (!video?.length) {
   throw new ApiError(404, "video not found");
 }
 
 return res
   .status(200)
   .json(new ApiResponse(200, video[0], "video found successfully"));

 
})


const getUserVideos = asyncHandler(async (req, res) => {

   const userId = req.user._id

   if(!isValidObjectId(userId)){
      throw new ApiError(400, "Invalid user id")
   }

   const videos = await Video.find({owner:userId})

   if(videos.length === 0){
      throw new ApiError(404, "videos not found")
   }

   return res
      .status(200)
      .json(new ApiResponse(200,videos,"videos found successfully"))
})


const updateVideo = asyncHandler(async (req, res) => {

   const {videoId} = req.params
   const {title, description} = req.body

   if(!isValidObjectId(videoId)){
      throw new ApiError(400, "Invalid video id")
   }

   if(!videoId){
      throw new ApiError(400, "videoId is required")
   }

   if(!(title || description)){
      throw new ApiError(400, "title or description is required")
   }

   const video = await Video.findById(videoId)

   if(!video){
      throw new ApiError(404, "video not found")
   }

   if(video.owner.toString() !== req.user?._id.toString()){
      throw new ApiError(401, "unathorized user")
   }

   const localThumbnailUrl = req.file?.path

   if(!localThumbnailUrl){
      throw new ApiError(400, "thumbnail is required")
   }

   const thumbnailUrl = await upLoadOnCloudinary(localThumbnailUrl)

   if(!thumbnailUrl){
      throw new ApiError(500, "something went wrong while uploading thumbnail")
   }

   const updatedVideo = await Video.findByIdAndUpdate(videoId, {
      title,
      description,
      thumbnail: thumbnailUrl.url
   },
   {new:true}

   )

   if(!updatedVideo){
      throw new ApiError(500,"something went wrong while uploading video")
   }

   return res
      .status(200)
      .json(new ApiResponse(200,updatedVideo,"successfully updated video details"))

})


const deleteVideo = asyncHandler(async (req, res) => {
   
      const {videoId} = req.params

      if(!isValidObjectId(videoId)){
         throw new ApiError(400, "Invalid video id")
      }
   
      if(!videoId){
         throw new ApiError(400, "videoId is required")
      }
   
      const video = await Video.findById(videoId)
   
      if(!video){
         throw new ApiError(404, "video not found")
      }
   
      if(video.owner.toString() !== req.user._id.toString()){
         throw new ApiError(401, "unathorized user")
      }
   
      await Video.findByIdAndDelete(videoId)
   
      return res
         .status(200)
         .json(new ApiResponse(200,{}, "successfully deleted video"))
})


export {
      publishVideo,
      isPublishVideo,
      getAllVideos,
      getVideoById,
      getUserVideos,
      updateVideo,
      deleteVideo,    
}