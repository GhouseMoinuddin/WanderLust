import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import ejs from "ejs";
import dotenv from "dotenv";
import Listing from "./models/listing.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.get("/home", (req, res) => {
    return res.json({ "hello": "world" });
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))


app.get("/", (req, res) => {
    res.send("Hi, I am root");
})

//Index Route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
})

//show route

app.get("/listings/:id", (req, res) => {
    let { id } = req.params;
})

// app.get("/test", async (req,res) => {
//     let sampleListing = new Listing({
//         title:"My home villa",
//         description:"welcome",
//         price:"2000",
//         location:"hyderabad",
//         country:"India"
//     });

//     await sampleListing.save();
//     console.log("Done");
//     res.send("testing done!");
// })

const start = async () => {
    try {
        const MONGO_URL = process.env.MONGODB_URL;
        const connectionDb = await mongoose.connect(MONGO_URL);

        console.log(`mongo Connected DB Host: ${connectionDb.connection.host}`);
        app.listen(app.get("port"), () => {
            console.log("server is listening on port 8000");
        })
    } catch (error) {
        console.error("MongoDB connection failed!", error.message);
    }


}

start();