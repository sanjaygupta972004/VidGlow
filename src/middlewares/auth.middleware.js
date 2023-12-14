import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import jwt from "jsonwebtoken";

export const jwtVerify  = asyncHandler(async(req,_,next)=>{

  try {
   const token = req.cookeis?.accessToken || req.headers("Authorization")?.replace("Bearer","");
   if(!token){
       throw new ApiError(401, "unauthorized")
   };

   const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

   const user = await User.findById(decoded._id).select("-password -refreshToken");

   if(!user){
       throw new ApiError(404, "user not found");
   };

   req.user = user;

   next();
   
  } catch (error) {
     res.status(error.statusCode || 500).json({
       success:false,
       message:error.message || "internal server error"
   })
  }
})