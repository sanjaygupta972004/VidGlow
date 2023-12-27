import { Router } from "express";

import {
     registerUser,
     loginUser, 
     logoutUser,
     reGenerateAccessToken,
     changeCurrentUserPassword,
     getCurrentUser,
     updateUserProfile,
     updateAvatar,
     updateCoverImage,
     getUserChannelProfile,
     getWatchHistory,
      


    } from "../controllers/user.controller.js";

import {upload} from "../middlewares/multer.middleware.js"

import { jwtVerify } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
        upload.fields([
            {
                name: "avatar",
                maxCount:  1
            }, 
            {
                name: "coverImage",
                maxCount: 1
            }
        ]),
        registerUser
        );

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(jwtVerify,logoutUser);    
router.route("/refresh-Token").post(reGenerateAccessToken);  
router.route("/change-password").post(jwtVerify, changeCurrentUserPassword)  
router.route("/current-user").get(jwtVerify,getCurrentUser)
router.route("/update-profile").patch(jwtVerify,updateUserProfile)
router.route("/update-avatar").patch(jwtVerify, upload.single("avatar"), updateAvatar)
router.route("/update-coverImage").patch(jwtVerify, upload.single("coverImage"),  updateCoverImage)
router.route("/c/:username").get(jwtVerify, getUserChannelProfile) 
router.route("/watchHistory").get(jwtVerify,getWatchHistory)

export default router

