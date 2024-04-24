import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,  // 10 minutes
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        return req.clientIp  // ip address from requestIp.mw()
    },
    handler: (_,  options) => {
        throw new Error(
         options.statusCode || 500,
         `There are too many requests. You are only allowed ${
         options.limit
       }  requests per ${options.windowMs / 60000} minutes`
    )
    }
})