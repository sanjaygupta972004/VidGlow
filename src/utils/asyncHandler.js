const asyncHandler  = (requestHandler)=>{

        (req,res,next) => {
                Promise.resolve(requestHandler(req,res,next))
                .catch(err => next(err))

}}

export {asyncHandler}


// const asyncHandler2 = (fn)=> async(req,res,nest)=>{
//  try {
//        await fu(req,res,nest)
        
//  } catch (error) {
//     res.status(error.code || 500).json({
//         success: false,
//         message: error.message
//     })    
//  }
// }