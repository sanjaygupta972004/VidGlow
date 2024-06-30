import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import requestIp from "request-ip"
import { errorMiddleware } from './middlewares/error.middleware.js';
import { rateLimiter } from './middlewares/rateLimiter.middlewares.js';
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
app.use(requestIp.mw())
app.use(rateLimiter)
// routers import 
import userRouter  from "./routers/user.route.js";
import tweetRouter  from "./routers/tweet.router.js";
import videoRouter from "./routers/video.router.js";
import playlistRouter from "./routers/playlist.router.js";
import commentRouter from "./routers/comment.router.js"
import likeRouter from "./routers/like.router.js"
import subscriptionRouter from "./routers/subscription.router.js"

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/playlists", playlistRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)


app.use(errorMiddleware)

export {app}