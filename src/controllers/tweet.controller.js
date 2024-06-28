import { ApiResponse} from "../utils/ApiResponse.js"
import { Tweet } from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"


const createTweet = asyncHandler(async (req, res) => {
   const {content} = req.body

   if(!content){
      throw new ApiError(400, "Content is required to tweet")
   }

   const owner = req.user?._id
   if(!isValidObjectId(owner)){
      throw new ApiError(400, "Invalid user id")
   }


   const oldTweet = await Tweet.findOne({content});

   if(oldTweet){
      throw new ApiError(400, "already tweeted this content pls tweet another content")
   }

   const tweet = await Tweet.create(
      {
          content,
          owner,
      })   

   return res
      .status(201)
      .json(new ApiResponse(201, tweet, "tweeted successfully done"))

})


const getUserTweets = asyncHandler(async (req, res) => {

   const userId = req.user?._id

   if(!isValidObjectId(userId)){
      throw new ApiError(400, "Invalid user id")
   }

   const tweets = await Tweet.find({
      owner: userId
   }).populate("owner", "username email avatar").sort({createdAt: -1}).skip(0)

   if(!tweets){
      throw new ApiError(404, "No tweets found")
   }

   const tweetIds = tweets.map((tweet) => tweet._id)

   const likes = await Like.find({
      tweet: {
         $in: tweetIds
      }
   })

   const tweetData = tweets.map((tweet) => {
    const totalLikes = likes.filter((like) => like.tweet.toString() === tweet._id.toString()).length
      return {
         ...tweet.toObject(),
         totalLikes,
      }
   })

   return res
      .status(200)
      .json(new ApiResponse(200, tweetData, "tweets found"))

})


 const getAllTweets = asyncHandler(async (req, res) => {

   const userId = req.user?._id
   const {page =1, limit =10} = req.query
   const persePage = parseInt(page,10)
   const parseLimit = parseInt(limit,10)
   const skip = (persePage - 1) * parseLimit


   const tweets = await Tweet.find({}).sort({createdAt: -1}).skip(skip).limit(parseLimit).populate("owner", "username email avatar")

   if(!tweets){
      throw new ApiError(404, "No tweets found")
   }

   if(!tweets){
      throw new ApiError(404, "No tweets found")
   }

   const tweetIds = tweets.map((tweet) => tweet._id)

   const likes = await Like.find({
      tweet: {
         $in: tweetIds
      }
   })

   const tweetData = tweets.map((tweet) => {
      const totalLikes = likes.filter((like) => like.tweet.toString() === tweet._id.toString()).length
      return {
         ...tweet.toObject(),
         totalLikes,
      }
   })

   return res
      .status(200)
      .json(new ApiResponse(200, tweetData, "tweets fetch successfully done"))


 })


const getTweetById = asyncHandler(async (req, res) => {
   const {tweetId} = req.params

   if(!isValidObjectId(tweetId)){
      throw new ApiError(400, "Invalid tweet id")
   }

   const tweet = await Tweet.findById(tweetId).populate("owner", "username email avatar ") 
   const likes = await Like.find({tweet: tweet})
   const tweetData = {
      ...tweet.toObject(),
      totalLikes: likes.length,
   }

   if(!tweet){
      throw new ApiError(404, "tweet does not exist")
   }

   return res
      .status(200)
      .json(new ApiResponse(200, tweetData, "tweet found"))
})


const updateTweet = asyncHandler(async (req, res) => {

   const {tweetId} = req.params
   const {content} = req.body

   if(!isValidObjectId(tweetId)){
      throw new ApiError(400, "Invalid tweet id")
   }

   if(!content && !tweetId){
      throw new ApiError(400, "Content and tweetId are required")
   }

   const tweet =  await Tweet.findById(tweetId)

   if(!tweet){
      throw new ApiError(404, "tweet does not exist")
   }

   if(tweet.owner.toString() !== req.user?._id.toString()){
      throw new ApiError(401, "unauthorized user")
   }

   tweet.content = content

   const updatedTweet =  await tweet.save()

   return res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "tweet updated"))

}) 



const deleteTweet = asyncHandler(async (req, res) => {
   const {tweetId} = req.params
  
   if(!isValidObjectId(tweetId)){
      throw new ApiError(400, "Invalid tweet id")
   }

   const result = await Tweet.findById(tweetId)

   if(!result){
      throw new ApiError(404, "tweet does not exist")
   }

   if(result.owner.toString() !== req.user._id.toString()){
      throw new ApiError(401, "unauthorized user")
   }

   await result.deleteOne()

   return res
      .status(200)
      .json(new ApiResponse(200, {}, "tweet deleted"))
})



export {
      createTweet,
      getUserTweets,
      getAllTweets,
      getTweetById,
      updateTweet,
      deleteTweet,
}