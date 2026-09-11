import mongoose, { Mongoose } from "mongoose";
import initData from "./data.js";
import Listing from "../models/listing.js";


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((error) => {
    console.log(error);
  })

async function main() {
    await Mongoose.connect(process.env.MONGODB_URL);  
}

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data was initialized!");
}

initDB();