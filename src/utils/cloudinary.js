import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

import dotenv from "dotenv";

dotenv.config({
  path: "./.env"

});

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY , 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upLoadOnCloudinary = async function(localFilePath) {
  try {
      if (!localFilePath) return null;

      // upload file to Cloudinary
      const response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: "auto"
      });

      // file is successfully uploaded
      fs.unlinkSync(localFilePath); // remove locally saved temporary file path
      return response;

  } catch (error) {
      console.error("Error uploading to Cloudinary:", error.message); // log the error for debugging

      if (fs.existsSync(localFilePath)) { // check if file exists before attempting to delete
          fs.unlinkSync(localFilePath); // remove locally saved temporary file path
      }
      return null;
  }
}


const getPublicId = (url) => {

   const splitUrl = url.split("/")
   const publicId = splitUrl[splitUrl.length - 1].split(".")[0]

    return publicId

    // another method to extract public id

  // const publicId = cloudinary.url(url, { fetch_format: 'auto' }).public_id;

}


 const deleteFromCloudinary = async function(publicId) {
  try {
      if (!publicId) return null;

       await cloudinary.uploader.destroy(publicId,(error,result)=>{
        if(error){
           throw error.message
        }
        else{
          console.log("delete image successfully from clodinary",result)
        }
      });

     return null;

  } catch (error) {
      console.error("Error deleting from Cloudinary:", error.message);
  }
}


const thumbnailUrl =   async function(url) {
    try {
        if (!url) return null;
        
        const thumbnailUrl  = url.replace("mp4", "png")

        return thumbnailUrl;

    }catch (error) {
        console.error("Error generating thumbnail:", error.message);
        return null;
    }
}


export {
  upLoadOnCloudinary,
  deleteFromCloudinary,
  getPublicId,
  thumbnailUrl
 }