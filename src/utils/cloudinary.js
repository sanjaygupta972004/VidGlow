import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY , 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinary  =  async function(localFilePath){
try {
  if(!localFilePath) return null;
  // upload file the cloudinary
  const response = await cloudinary.uploader.upload(localFilePath,{
    resource_type:"auto"
  });

  // file is successfully uploaded
  console.log("upload successful", response.url);
} catch (error) {
  fs.unlinkSync(localFilePath) // remove localy  saved  temporary file path 
  return null;
}
}

export {cloudinary}