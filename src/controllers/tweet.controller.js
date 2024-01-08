import { ApiResponse} from "../utils/ApiResponse.js"
import { Tweet } from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// todo : create a tweet, get all tweets, get a single tweet,
// update a tweet, delete a tweet

const createTweet = asyncHandler(async (req, res) => {
   const {content} = req.body

   if(!content){
      throw new ApiError(400, "Content is required")
   }

   //console.log(content );

   const owner = req.user._id
   if(!owner){
      throw new ApiError(400, "unathorized user")
   }


   const oldTweet = await Tweet.findOne({content});

   if(oldTweet){
      throw new ApiError(400, "tweet already exists")
   }

   const tweet = await Tweet.create(
      {
          content,
          owner,
      })   

   return res
      .status(201)
      .json(new ApiResponse(201, tweet, "tweet created"))

})


const getUserTweets = asyncHandler(async (req, res) => {

   const tweets = await Tweet.find({
      owner: req.user._id
   })

   if(!tweets){
      throw new ApiError(404, "No tweets found")
   }

   return res
      .status(200)
      .json(new ApiResponse(200, tweets, "tweets found"))

})


 const getTweets = asyncHandler(async (req, res) => {

   const tweets = await Tweet.find({})

   if(!tweets){
      throw new ApiError(404, "No tweets found")
   }

   return res
      .status(200)
      .json(new ApiResponse(200, tweets, "tweets found"))


 })


const updateTweet = asyncHandler(async (req, res) => {

   const {tweetId} = req.params
   const {content} = req.body

   if(!content && !tweetId){
      throw new ApiError(400, "Content and tweetId are required")
   }

   const tweet =  await Tweet.findById(tweetId)

   if(!tweet){
      throw new ApiError(404, "tweet does not exist")
   }

   if(tweet.owner.toString() !== req.user._id.toString()){
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
      getTweets,
      updateTweet,
      deleteTweet,
}