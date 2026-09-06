import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

app.set("port",(process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb", extended:true}));


app.get("/home", (req,res)=> {
    return res.json({"hello":"world"});
});

const start = async () => {
    const connectionDb = await mongoose.connect("mongodb+srv://ghousemoinuddin118_db_user:Shaariq24@cluster0.xrpizy4.mongodb.net/?appName=Cluster0");
    
    console.log(`mongo Connected DB Host: ${connectionDb.connection.host}`);
    app.listen(app.get("port"), ()=> {
        console.log("server is listening on port 8000");
    })
}

start();