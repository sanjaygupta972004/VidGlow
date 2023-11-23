const asyncHandler  = (requestHandler)=>{

       return (req,res,next) => {
                Promise.resolve(requestHandler(req,res,next))
                .catch(err => next(err))

}}

export {asyncHandler}

// second methd to handle async request and response

// const asyncHandler = (fn)=> async(req,res,nest)=>{
//  try {
//        await fu(req,res,nest)
        
//  } catch (error) {
//     res.status(error.code || 500).json({
//         success: false,
//         message: error.message
//     })    
//  }
// }