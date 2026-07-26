const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const fs = require("fs");
const net = require("net");
const { spawn } = require("child_process");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const WrapASync = require("./utils/wrapAsync");

const port = 8080;

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const MONGOD_EXE = "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe";
const MONGOD_CONFIG = path.join(__dirname, "mongod-local.cfg");
const MONGO_HOST = "127.0.0.1";
const MONGO_PORT = 27017;

main()
   .then(()=>{
      console.log("connected to DB");
      app.listen(port, ()=> {
         console.log(`server is listening to port: ${port}`);
      });
   })
   .catch((err) => {
    console.log(err);
   });

async function main() {
    try {
        await connectToMongo();
    } catch (err) {
        if (!isMongoConnectionRefused(err)) {
            throw err;
        }

        console.log("MongoDB is not running. Starting local MongoDB...");
        startLocalMongo();
        await waitForPort(MONGO_PORT, MONGO_HOST);
        await connectToMongo();
    }
}

function connectToMongo() {
    return mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 3000 });
}

function isMongoConnectionRefused(err) {
    return err?.message?.includes("ECONNREFUSED");
}

function startLocalMongo() {
    if (!fs.existsSync(MONGOD_EXE)) {
        throw new Error(`mongod.exe not found at ${MONGOD_EXE}`);
    }

    if (!fs.existsSync(MONGOD_CONFIG)) {
        throw new Error(`MongoDB config not found at ${MONGOD_CONFIG}`);
    }

    const mongod = spawn(MONGOD_EXE, ["--config", MONGOD_CONFIG], {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
    });

    mongod.unref();
}

function waitForPort(port, host, retries = 20) {
    return new Promise((resolve, reject) => {
        const tryConnect = (attemptsLeft) => {
            const socket = net.createConnection({ port, host });

            socket.once("connect", () => {
                socket.end();
                resolve();
            });

            socket.once("error", () => {
                socket.destroy();

                if (attemptsLeft === 0) {
                    reject(new Error(`MongoDB did not start on ${host}:${port}`));
                    return;
                }

                setTimeout(() => tryConnect(attemptsLeft - 1), 500);
            });
        };

        tryConnect(retries);
    });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

const validateListing = (req, res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else {
        next();
    }
}

//index route
app.get("/listings", wrapAsync(async (req, res)=> {
    let allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
}));

//new Route
app.get("/listings/new", (req,res)=>{
    res.render("./listings/new.ejs");
});

//show route
app.get("/listings/:id", WrapASync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", {listing})
}));

//Create Route
app.post("/listings", validateListing, wrapAsync (async (req, res, next)=> {
    // let {title,description, image, price, country, location} = req.body;
    // let listing = req.body.listing;
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    }
));

//Edit Route
app.get("/listings/:id/edit", WrapASync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", {listing});
}));

//update route
app.put("/listings/:id", validateListing, wrapAsync(async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", WrapASync(async (req,res)=> {
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
}));
// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title : "My new villa",
//         description : "By the beach",
//         price : 1200,
//         location : "Calcuncata, Goa",
//         counntry : "india",

//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
})

app.use((err, req, res, next) => {
    let {statusCode, message} = err;
    // console.log(err);
    res.status(statusCode).send(message);
});

//.toLocaleString("en-country initial like IN,US,UK,GER etc.") provides commas 
