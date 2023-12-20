import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const jwtVerify  = asyncHandler(async(req,_,next)=>{
  try { 
    //console.log(req.header("Authorization"));
    //console.log(req.cookies);

    let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

     //console.log(token);
   
     if(!token){
  
       throw new ApiError(401, "unauthorized access")
     };

   const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

   // console.log(decoded);

   const user = await User.findById(decoded._id).select("-password -refreshToken");

   if(!user){
       throw new ApiError(404, "user not found");
   };

   req.user = user;

   next();} catch (error) {
    new ApiError (401, "unauthorized user access")
   }
   
  
})