import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import { upLoadOnCloudinary } from "../utils/cloudinary.js"



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

   console.log(localVideoUrl)  

   if(!localVideoUrl) {
      throw new ApiError(400, "video file is required")
   }

   const videoUrl = await upLoadOnCloudinary(localVideoUrl)


   if(!videoUrl){
      throw new ApiError(500, "something went wrong while uploading video")
   }

   const thumbnailUrl =  videoUrl.url.replace("mp4", "png")

   if(!thumbnailUrl){
      throw new ApiError(500, "error while generating thumbnail")
   }

   const owner = req.user._id

   console.log(owner)   

   if(!owner){
      throw new ApiError(400, "unathorized user")
   }

   const video = await Video.create({
      title,
      description,
      videoFile: videoUrl.url,
      thumbnail: thumbnailUrl,
      owner
   })

   if(!video){
      throw new ApiError(500, "something went wrong while creating video")
   }

   return res
      .status(201)
      .json(new ApiResponse(201,video,"video created successfully"))

})


const getAllVideos = asyncHandler(async (req, res) => {
   const {page = 1, limit = 10, sortBy,sortType, query,userId} = req.body
    
   const skip = (page - 1) * limit

    let mongoQuery = {}

 
   if(query ){
      mongoQuery.$or = [
          {title: {$regex:query, $options: "i"}},
          {description: {$regex:query, $options: "i"}}
         ]
   }

  
   console.log(mongoQuery)

   let sortParams = {}

   if(sortBy){
      sortParams[sortBy] = sortType==="asc" ? 1 : -1
   }

   console.log(sortParams)

   const videos = await Video.find(mongoQuery)
      .skip(skip)
      .limit(limit)
      .sort(sortParams)


   if(!videos){
      throw new ApiError(404, "videos not found")
   }

   return res
      .status(200)
      .json(new ApiResponse(200,videos,"videos found successfully"))


})


const getVideoById = asyncHandler(async (req, res) => {
   
   const {videoId} = req.params

   if(!videoId){
      throw new ApiError(400, "videoId is required")
   }

   const video = await Video.findById(videoId)

   if(!video){
      throw new ApiError(404, "video not found")
   }

   return res
      .status(200)
      .json(new ApiResponse(200,video,"video found successfully"))
})


const getUserVideos = asyncHandler(async (req, res) => {

   const userId = req.user._id

   if(!userId){
      throw new ApiError(401, "unathorized user")
   }

   const videos = await Video.find({owner:userId})

   if(!videos){
      throw new ApiError(404, "videos not found")
   }

   return res
      .status(200)
      .json(new ApiResponse(200,videos,"videos found successfully"))
})


const updateVideo = asyncHandler(async (req, res) => {

   const {videoId} = req.params
   const {title, description} = req.body

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

   if(video.owner.toString() !== req.user._id.toString()){
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
      getAllVideos,
      getVideoById,
      getUserVideos,
      updateVideo,
      deleteVideo,    
}