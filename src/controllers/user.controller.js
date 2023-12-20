import {asyncHandler} from "../utils/asyncHandler.js";

import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {upLoadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async(userId)=>{
  const user = await User.findById(userId)
  if(!user){
    throw new ApiError(404,"user not found")
  }

 // console.log(user)
  
  const accessToken =  await user.generateAccessToken();
  const refreshToken = await user.generateRefresToken();

 // console.log({accessToken, refreshToken})

  user.refreshToken = refreshToken;
  await user.save({validateBeforeSave:false});

  return {accessToken, refreshToken}

};


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

    //   console.log(req.body)

    // basic method to check empty fild validation

        // if(email===""){
        //        throw new ApiError(400, "Invalid email")

        // }

        if([email, username, fullName, password].some((fild)=> fild?.trim()==="")){
                throw new ApiError(400, "all fields are required")
        }

        
       const existedUser =  await User.findOne({
                $or:[{email}, {username}]
        })

        if(existedUser){
                throw new ApiError(409,"User already exists")
        }

        console.log(req.files)


     const avatarLocalPath = req.files?.avatar[0]?.path;

    // console.log(avatarLocalPath)
   

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

       if(!avatarLocalPath){
        throw new ApiError(409,"Avatar is required")
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

});


const loginUser =  asyncHandler(async(req,res)=>{
// step to login user

// get user email and password from frontend
// validate email and password
// check if user exists
// check if password matches
// generate access token and refresh token
// send refresh token in cookie
// save refresh token in db
// return res

const {email, password,username} = req.body;

//console.log({email, password,username})

if(!email && !username){
  throw new ApiError(400,"email or username is required")
}

// if (!(email || password)) {
//   throw new ApiError(400,"email or password is required")
// }

const user = await User.findOne(
  {$or:[{email},{username}]}
  );

  if(!user){
    throw new ApiError(401,"user does not exist");
  }
 
 //console.log(user)

  const isPasswordMatch = await user.isPasswordCorrect(password);

  

  if(!isPasswordMatch){
    throw new ApiError(401,"invalid credentials");
  }

  const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

  const options ={
    httpOnly:true,

  }

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  //console.log(loggedInUser)

 return res
  .status(200)
  .cookie("refreshToken",refreshToken,options)
  .cookie("accessToken",accessToken,options)
  .json(
    new ApiResponse(
      200,
      {user:loggedInUser,accessToken, refreshToken,
       },
      "user logged in successfully"
      )
  )
});



const logoutUser = asyncHandler(async(req,res)=>{
  // step to logout user

  // get refresh token from cookie or header to middleware
  // delete refresh token from db
  // delete refresh token from cookie
  // delete access token from cookie
  // return res

  await User.findByIdAndUpdate(req.user._id,
    {
     $set:{
      refreshToken : undefined
     }
   },
   {
   new : true,
   }
  )

  const options ={
    httpOnly:true,
    secure:true,
  };

 return res
     .status(200)
     .clearCookie("refreshToken",options)
     .clearCookie("accessToken",options)
     .json(
     new ApiResponse(200,undefined,"user logged out successfully")
  )

});



const refreshToken = asyncHandler(async(req,res)=>{

  //step to refresh token

  // get refresh token from cookie or body
  // check if refresh token exists
  // verify refresh token from jwt 
  // generate new access token
  // send new access token in response
  // return res


  const {refreshToken} = req.cookies.refreshToken || req.body.refreshToken;

  if(!refreshToken){
    throw new ApiError(400,"unauthorized request");
  } 

  const decode =  jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);

  if(!decode){
    throw new ApiError(400,"unauthorized user");
  }

  const existingUser = await User.findById(decode._id);

  console.log(existingUser) 

  if(!existingUser){
    throw new ApiError(400,"user does not exist");
  } 

  const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(existingUser._id);

  const options ={
    httpOnly:true,
  };

  return res
  .status(200)
  .cookie("refreshToken",newRefreshToken,options)
  .cookie("accessToken",accessToken,options)
  .json(
    new ApiResponse(200,undefined,"token refreshed successfully")
  )


});






export {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
     
   }