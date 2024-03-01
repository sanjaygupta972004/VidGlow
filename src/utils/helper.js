
import fs from 'fs';

 export const getStaticFile = (filename) => {
   if (!filename) return null
   const filePath = `${req.protocol}://${req.get('host')}/public/${filename}`
   return filePath

}

 export const getLocalFile =  (filename) => {
      if (!filename) return null
      const filePath = `./public/${filename}`
      return filePath
}


 export const deleteLocalFile = (localFile) => {
   try {
      if (!localFile) return null

      fs.unlinkSync(localFile,(err)=>{
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

export const removeUnusedMulterFilesOnError = (req) =>{
   const files = req.files
   const file = req.file
   if(file){
      deleteLocalFile(file.path)
   }

   if(files){
      const filesValuesArray = Object.values(files)   
      filesValuesArray.map(fileFiled => {
         fileFiled.map(file => {
            deleteLocalFile(file.path)
         })
      })
   }
}
