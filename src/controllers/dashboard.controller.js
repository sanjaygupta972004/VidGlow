import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {Video} from "../models/video.model.js";
import {Comment} from "../models/comment.model.js";
import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";



const getChannelVideos = asyncHandler(async (req,res,) => {
        const {channelId} = req.params;
        if(!isValidObjectId(channelId)){
            throw new ApiError(400,"Invalid channel Id")
        }
        const user = await User.findById(channelId);
        if(!user){
            throw new ApiError(404,"This channel does not exist")
        }
       
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            sort: {createdAt: -1}
        }

        const pipeline = [
                {
                  $match: {
                    owner: new mongoose.Types.ObjectId(channelId)
                  }
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "channel"
                  }
                },
                {
                  $unwind: "$channel"
                },
                {
                  $sort: options.sort
                },
                {
                  $skip: (options.page - 1) * options.limit
                },
                {
                  $limit: options.limit
                },
                {
                  $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "video",
                    as: "comments"
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
                    totalComment: {
                      $size: "$comments"
                    },
                    totalLike: {
                      $size: "$likes"
                    }
                  }
                },
                {
                  $project: {
                        title: 1,
                        description: 1,
                        thumbnail: 1,
                        videoUrl: 1,
                        isPublished: 1,
                        createdAt: 1,
                    comments: {
                      content: 1,
                      owner: 1,
                    },
                    totalComment: 1,
                    totalLike: 1,
                    channel: {
                      _id: 1,
                      username: 1,
                      email: 1,
                      avatar: 1,
                    },
                  }
                }
              ]
   const videoAggregate = await Video.aggregate(pipeline)
    if(!videoAggregate){
            throw new ApiError(404,"No videos found for this channel")
    }
        
    return res
    .status(200)
    .json(new ApiResponse(200,videoAggregate, "Videos retrieved successfully"))
      
})


const getChannelState = asyncHandler(async (req,res) => {
        const {channelId} = req.params;
        if(!isValidObjectId(channelId)){
                throw new ApiError(400,"Invalid channel Id")
        }
        const user = await User.findById(channelId);
        if(!user){
                throw new ApiError(404,"This channel does not exist")
        }

        const subscribers = await Subscription.countDocuments({channel: channelId})
        const videos = await Video.find({owner: channelId})
        const likes = await Like.countDocuments({
                video: {$in: await Video.find({owner: channelId}).select("_id")}
        
        })

        const comments = await Comment.find({
                video: {$in: await Video.find({owner: channelId}).select("_id")}
        })

        const data = {
              totalLikesFromThisChannel: likes,
              totalCommentsFromThisChannel: comments,
              totalSubscribers: subscribers,
              totalVideos: videos
        }

        return res
        .status(200)
        .json(new ApiResponse(200,data, "Channel state retrieved successfully"))
})

export {
        getChannelVideos,
        getChannelState
}