import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credentials:true,
}));

app.use(express.json({ limit:"30mb"}));
app.use(express.urlencoded({
        extended: true,
        limit: "30mb"
}));
app.use(express.static("public"))
app.use(cookieParser());


// routers import 
import userRouter  from "./routers/user.route.js";
import tweetRouter  from "./routers/tweet.router.js";
import videoRouter from "./routers/video.router.js";
import playlistRouter from "./routers/playlist.router.js";


// routes declaration

app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/playlists", playlistRouter)




export {app}