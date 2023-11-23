import {asyncHandler} from "../utils/asyncHandler.js";

import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {upLoadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser =  asyncHandler(async(req,res)=>{

    // step to register user

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

       
        const {email, username, fullName, password} = req.body


// first method to check empty fild validation

        // if(email===""){
        //        throw new ApiError(400, "Invalid email")

        // }

        if([email, username, fullName, password].some((fild)=> fild?.trim()==="")){
                throw new ApiError(400, "all fields are required")
        }

       // console.log(req.body)

       const existedUser =  await User.findOne({
                $or:[{email}, {username}]
        })

        if(existedUser){
                throw new ApiError(409,"User already exists")
        }


     
        console.log(req.files.coverImage[0])


       const avatarLocalPath = req.files?.avatar[0]?.path;
       const coverImageLocalPath = req.files?.coverImage[0]?.path;

       if(!avatarLocalPath){
        throw new ApiError(409,"avatar is required")
       }

      const avatar = await upLoadOnCloudinary(avatarLocalPath)
      const coverImage = await upLoadOnCloudinary(coverImageLocalPath)

      if(!avatar){
        throw new ApiError(409,"avatar is required")
      }

      const user =  await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase(),
      })

      const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken"
    )

       if(!createdUser){
       throw new ApiError(503,"something went wrong while creating a new user")
     }
        

     return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
     )




})

export default registerUser