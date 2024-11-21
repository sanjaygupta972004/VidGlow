import dotenv from "dotenv";

import connectionDb from "./db/index.js";

import {app} from "./app.js"

dotenv.config({
        path: "./.env"
})


let appName = process.env.APP_NAME


connectionDb()
.then(()=>{
        
        app.listen(process.env.PORT||8000,()=>{
                console.log(` Server ${appName} listening on port !!: ${process.env.PORT}`)
        });
})
.catch((err)=>{
        console.log(`mongoDb connection Error: ${err}`)
})




// second method to connect mongodb 

/*
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/