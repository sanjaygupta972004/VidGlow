import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js"; 
import { isValidObjectId } from "mongoose";


const toggleToSubscription = asyncHandler(async(req,res)=> {
  const {channelId} = req.params;
  const userId = req.user?._id;
  if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id")
  }
   const channel = await User.findById(channel)
        if(!channel){
          throw new ApiError(404,"Channel does not exist in the database")      
        }
   const subscription = await subscription.findOne({
        $and:[
                {subscriber:userId},
                {channel:channelId}
        ]
   })

   if(subscription){
        throw new ApiError(400,"You are already subscribed to this channel")
   }
   
   const newSubscription = await Subscription.create({
        subscriber:userId,
        channel:channelId
   })

   if(!newSubscription){
        throw new ApiError(500,"Could not subscribe to this channel")
   }

   return res
        .status(200)
        .json(new ApiResponse(200,newSubscription," You have successfully subscribed to this channel"))

})


const getUserChannelSubscribers = asyncHandler(async(req,res)=> {
        const {channelId} = req.params;
        if(!isValidObjectId(channelId)){
                throw new ApiError(400,"Invalid channel id")
        }
     
        const subscribers =  await Subscription.aggregate([
                {
                        $match:{channel:channelId}
                },
                {
                        $lookup:{
                                from:"users",
                                localField:"subscriber",
                                foreignField:"_id",
                                as:"subscriber"
                        }
                },
                {
                        $addFields:{
                             totalSubscriber:{
                                $size:"$subscriber"
                             }
                        }
                },
                {
                        $project:{
                                _id:1,
                                subscriber:1,
                                totalSubscriber:1
                        }
                }
      
      ])

if(subscribers.length===0){
        throw new ApiError(404,"No subscribers found for this channel")
}

return res
        .status(200)
        .json(new ApiResponse(200,subscribers,"Subscribers found for this channel"))
        
})



const getSubscribedChannels = asyncHandler(async(req,res)=> {
  const subscriberId = req.user?._id;
        const subscribedChannel = await Subscription.aggregate([
                {
                        $match:{subscriber:subscriberId}
                },
                {
                        $lookup:{
                                from:"users",
                                localField:"channel",
                                foreignField:"_id",
                                as:"channel"
                        }
                },
                {
                        $addFields:{
                                totalChannel:{
                                        $size:"$channel"
                                }
                        }
                },
                {
                        $project:{
                                _id:1,
                                channel:1,
                                totalChannel:1
                        }
                }
        ])
        if(subscribedChannel.length===0){
                throw new ApiError(404,"No channel found")
        }
        return res
                .status(200)
                .json(new ApiResponse(200,subscribedChannel,"Subscribed channels found for this user"))
})

export {
        toggleToSubscription,
        getUserChannelSubscribers,
        getSubscribedChannels
} 