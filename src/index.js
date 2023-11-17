import dotenv from "dotenv";

import connectionDb from "./db/index.js";

import {app} from "./app.js"

dotenv.config({
        path: "./env"
})

connectionDb()
.then(()=>{
        app.on((error)=>{
                 console.error("Error: ", error);
                 throw new Error
        });

        app.listen(process.env.PORT||8080,()=>{
                console.log(` Server listening on !!: ${process.env.PORT}`)
        });
})
.catch((err)=>{
        console.log(`mongoDb connection error: ${err}`)
})