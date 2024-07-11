import {ApiError} from "../utils/ApiError.js"
import { removeUnusedMulterFilesOnError } from "../utils/helper.js"
import mongoose from "mongoose"
import  logger  from "../utils/logger.js"


export const errorMiddleware = (err, req, res, next) => {
   let error  = err 
   if(!(error instanceof ApiError)){
     const statusCode = error.statusCode  =  error instanceof mongoose.Error ? 400 : 500
     const message =  error.message =  error.message || "Something went wrong"
      error = new ApiError(statusCode,message, error?.errors||[], error?.stack)
   }

   logger.error(`${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
   
    
  removeUnusedMulterFilesOnError(req)

   const response = {
      ...error,
      message: error.message,
      ...(process.env.NODE_ENV === 'development'? {stack: error.stack}:{}),
   }

   res
   .status(error.statusCode)
   .json(response)
}