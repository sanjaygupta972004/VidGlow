import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {Video} from "../models/video.model.js";
import {Comment} from "../models/comment.model.js";
import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";



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
            sort: {createdAt: "desc"}
        }

        const pipeline = [
                {
                        $match: {owner: channelId}
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
                                commentCount: {$size: "$comments"},
                                likeCount: {$size: "$likes"}
                        }
                        },
                        {
                        $project: {
                                comments: {
                                        content:1,
                                        owner:1,
                                },
                                likes: 0,
                                commentCount:1,
                                likeCount:1,
                                channel: {
                                        email:1,
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                },
                        }
                }
        ] 

        const videos = await Video.aggregatePaginate(pipeline,options)

       if(videos.data.length === 0){
               throw new ApiError(404,"No video found for this channel")
       }

       return res
        .status(200)
        .json(new ApiResponse(200,videos, "AllVideos retrieved successfully for this channel"))
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
        const videos = await Video.countDocuments({owner: channelId})
        const likes = await Like.countDocuments({
                video: {$in: await Video.find({owner: channelId}).select("_id")}
        
        })

        const comments = await Comment.countDocuments({
                video: {$in: await Video.find({owner: channelId}).select("_id")}
        })

        const data = {
                subscribers,
                videos,
                likes,
                comments
        }

        return res
        .status(200)
        .json(new ApiResponse(200,data, "Channel state retrieved successfully"))
})

export {
        getChannelVideos,
        getChannelState
}