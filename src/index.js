import dotenv from "dotenv";

import connectionDb from "./db/index.js";

dotenv.config({
        path: "./env"
})

connectionDb()