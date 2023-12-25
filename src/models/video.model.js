import mongoose, {Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
        {
            videoFile:{
                type : String, // cloudinary url
                required: true,
            },
            thumbnail:{
                type : String, // cloudinary url
                required: true,
            },
            title:{
                type : String, 
                required: true,
            },  
            description:{
                type : String,
                required: true,
            },
            views:{
                type : Number,
                default : 0,
            },
            isPublished:{
                Boolean:true, 
                default : true,
            },
            owner:{
                type : Schema.type.ObjectId,
                ref:"User"
            }

        },
        {timestamps: true}
        );
        
videoSchema.plugins(mongooseAggregatePaginate)

export const Video = mongoose.model('Video',videoSchema);
