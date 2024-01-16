
import fs from 'fs';

 export const deleteFile = async(filePath) => {
   try {
      if(filePath) return null

      if(filePath === undefined || filePath === null) {
         fs.unlinkSync(filePath)
      }

   return null

   } catch (error) {
      console.error(`Error deleting file: ${error.message}`)
   }
}
