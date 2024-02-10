
import fs from 'fs';

 export const deleteLocalFile = async(filePath) => {
   try {
      if (!filePath) return null

      fs.unlinkSync(filePath,(err)=>{
         if(err){
            throw err
         }
         else{
            console.log("delete image successfully from local",filePath)
         }
      
      }) // remove locally saved temporary file path
   return null

   } catch (error) {
      console.error(`Error deleting file: ${error.message}`)
   }
}
