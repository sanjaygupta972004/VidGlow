import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {upLoadOnCloudinary, deleteFromCloudinary,getPublicId} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


import jwt from "jsonwebtoken";
import mongoose, { isValidObjectId } from "mongoose";


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

        if([email, username, fullName, password].some((field)=> field?.trim()==="")){
                throw new ApiError(400, "all fields are required")
        }

        
       const existedUser =  await User.findOne({
                $or:[{email}, {username}]
        })

        if(existedUser){
                throw new ApiError(400,"User already exists")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path;
        //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  

        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
        }

        

        if(!avatarLocalPath){
         throw new ApiError(400,"Avatar is required")
        }

      const avatar = await upLoadOnCloudinary(avatarLocalPath)
      const coverImage = await upLoadOnCloudinary(coverImageLocalPath)

      //console.log(avatar.url)
      //console.log(coverImage.url)

      if(!avatar){
        throw new ApiError(400,"avatar is required")
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

if(!email && !username && !password){
  throw new ApiError(400,"All fileds are required")
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


const reGenerateAccessToken = asyncHandler(async(req,res)=>{

  //step to refresh token

  // get refresh token from cookie or body
  // check if refresh token exists
  // verify refresh token from jwt 
  // generate new access token
  // send new access token in response
  // return res

  //console.log(req.cookies.refreshToken)


  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

 // console.log(refreshToken)

  if(!refreshToken){
    throw new ApiError(400,"unauthorized request");
  } 

  const decode =  jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);

  if(!decode){
    throw new ApiError(400,"unauthorized user");
  }

  const existingUser = await User.findById(decode._id);

  //console.log(existingUser)   here received only refresh token

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


const changeCurrentUserPassword = asyncHandler(async(req,res)=>{
  // step to change password

  // get old password, new password and confirm password from frontend
  // validate old password, new password and confirm password
  // check if old password matches
  // check if new password and confirm password matches
  // update password in db
  // return res

  const {oldPassword, newPassword, confirmPassword} = req.body;

  if(!(oldPassword && newPassword && confirmPassword)){
    throw new ApiError(400,"all fields are required")
  }

  const user = await User.findById(req.user._id);

  if(!user){
    throw new ApiError(404,"user not found")
  }

  const isPasswordMatch = await user.isPasswordCorrect(oldPassword);

  if(!isPasswordMatch){
    throw new ApiError(401,"invalid credentials");
  }

  if(newPassword !== confirmPassword){
    throw new ApiError(400,"password does not match");
  }

  user.password = newPassword;

  await user.save({validateBeforeSave:false});

  return res.status(200).json(
    new ApiResponse(200,undefined,"password changed successfully")
  )
});



const getCurrentUser = asyncHandler(async(req,res)=>{
  // step to get current user

  // get user id from req.user
  // get user from db
  // return res

  const user = await User.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
      }
    },
    {
      $project:{
        fullName:1,
        username:1,
        email:1,
        avatar:1,
        coverImage:1,
        watchHistory:{
          videoUrl:1,
          title:1,
          description:1,
          thumbnail:1,
          createdAt:1,
          views:1,
        },
        watchHistoryCount:{
          $size:"$watchHistory"
        }
      }
    }
  ])

  if(!user){
    throw new ApiError(404,"user not found")
  }

  return res.status(200).json(
    new ApiResponse(200,user[0],"user details fetched successfully")
  )


});


const updateUserProfile = asyncHandler(async(req,res)=>{
  // step to update user profile

  // get user values from frontend or req.body
  // validate user values
  // update user details in db and returned updated user except password 
  // return res

  const {fullName, email} = req.body;

  if(!fullName || !email){
    throw new ApiError(400,"Both fields Email and FullName are Required")
  }
   
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName,
        email,
      }
    },
    {
      new:true,
    }
  ).select("-password");

  if(!updatedUser){
    throw new ApiError(503,"something went wrong while updating user profile")
  }

  return res.status(200).json(
    new ApiResponse(200,updatedUser,"user details updated successfully")
  )

});


const updateAvatar = asyncHandler(async(req,res)=>{
  // step to update avatar
  // get avatar from  req.file
  // validate avatar
  // upload avatar to cloudinary
  // update avatar in db
  // return res

  const avatarLocalPath = req.file?.path;

  //console.log(avatarLocalPath);

  if(!avatarLocalPath){
    throw new ApiError(400,"avatar is required")
  }

  const avatar = await upLoadOnCloudinary(avatarLocalPath);

  if(!avatar.url){
    throw new ApiError(503,"something went wrong while uploading avatar")
  }

  const user = await User.findById(req.user._id);

  if(!user){
    throw new ApiError(404,"user is not aviailable")
  }

  const publicId = getPublicId(user.avatar);

  await deleteFromCloudinary(publicId);


  const updatedUser = await User.findByIdAndUpdate({
    _id:req.user._id
  },
  {
    $set:{
      avatar:avatar.url
    }
  },
  {
    new:true,
  }
  ).select("-password");
  

  if(!updatedUser){
    throw new ApiError(503,"something went wrong while updating avatar")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200, updatedUser,"avatar updated successfully")
  )


  });


const updateCoverImage = asyncHandler(async(req,res)=>{
  // step to update cover image
  // get cover image from  req.file
  // validate cover image
  // upload cover image to cloudinary
  // update cover image in db
  // return res

  const coverImageLocalPath = req.file?.path;

 // console.log(req.file)

  if(!coverImageLocalPath){
    throw new ApiError(400,"cover image is required")
  }

  const coverImage = await upLoadOnCloudinary(coverImageLocalPath);

  if(!coverImage.url){
    throw new ApiError(503,"something went wrong while uploading cover image")
  }

  const user = await User.findById(req.user._id);

  if(!user){
    throw new ApiError(404,"user is not aviailable")
  }


  const publicId = getPublicId(user.coverImage);

  await deleteFromCloudinary(publicId);

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {
      new:true,
    }
  ).select("-password");  

  if(!updatedUser){
    throw new ApiError(503,"something went wrong while updating cover image")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,updatedUser,"cover image updated successfully")
  )
});


const getUserChannelProfile = asyncHandler(async(req,res)=>{

 const {username} = req.params;
  if(!username?.trim()){
    throw new ApiError(400,"username is missing")
  }

 const channel = await  User.aggregate([
      { 
        $match:{
          username:username.toLowerCase()
        }
      },
      {
        $lookup:{
          from: "subscriptions",
          localField:"_id",
          foreignField: "channel",
          as:"subscribers"
        }
        },
        {
          $lookup:{
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
          }
          },
          {
            $addFields:{
              subscribersCount:{
                $size:"$subscribers"
              },
                subscribedToCount:{
                $size:"$subscribedTo"
              },
              isSubscribed:{
                $cond:{
                  if:{$in:[req.user._id,"$subscribers.subscriber"]},
                  then:true,
                  else:false
                }
                } 
            }
          },
          {
            $project:{
              fullName:1,
              username:1,
              subscribersCount:1,
              subscribedToCount:1,
              isSubscribed:1,
              avatar:1,
              coverImage:1,
              email:1,
            }
          }         
  ])


  if(!channel?.length){
    throw new ApiError(404,"channel not found")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,channel[0],"channel details fetched successfully")
  )
  
});


const getWatchHistory = asyncHandler(async(req,res)=>{

  const user =   await User.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",

        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",

              pipeline:[
                {
                  $project:{
                    fullName:1,
                    avatar:1,
                    username:1
                  }
                }
              ]
            }
        },
      ]
      }
    }
  ]);


  return res
  .status(200)
  .json(new ApiResponse(200,user[0].watchHistory,"watch history details fetched successfully"))
})


const deleteUserAccount = asyncHandler(async(req,res)=>{
  const {userId} = req.params;
  if(!isValidObjectId(userId)){
    throw new ApiError(400,"Invalid user id")
  }
   
  const user = await User.findById(req.user._id);
  if(!user){
    throw new ApiError(404,"user is not available in db") 
  }
   
  if(userId.toString() !== req.user._id.toString()){
    throw new ApiError(403,"unauthorized request")
  }
  
   const deletedUser = await User.findByIdAndDelete(req.user._id);
   
    if(!deletedUser){
      throw new ApiError(503,"something went wrong while deleting user")
    }else
    {
      return res
      .status(200)
      .json(new ApiResponse(200,{},"user deleted successfully"))
    }
})


export {
    registerUser,
    loginUser,
    logoutUser,
    reGenerateAccessToken,
    changeCurrentUserPassword,
    getCurrentUser,
    updateUserProfile,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory,  
    deleteUserAccount, 
   }