import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import ejs from "ejs";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.set("port",(process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb", extended:true}));

app.get("/home", (req,res)=> {
    return res.json({"hello":"world"});
});

const start = async () => {
    try {
        const MONGO_URL = process.env.MONGODB_URL;
        const connectionDb = await mongoose.connect(MONGO_URL);
        
        console.log(`mongo Connected DB Host: ${connectionDb.connection.host}`);    
        app.listen(app.get("port"), ()=> {
            console.log("server is listening on port 8000");
        })
    }catch(error) {
        console.error("MongoDB connection failed!");
        console.log("MONGODB_URL:", process.env.MONGODB_URL);
    }

    
}

start();