import mongoose from "mongoose";
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:String,
    image:{
        type:String,
        default:"https://unsplash.com/photos/coastal-road-along-bay-at-golden-hour-7yf4-H-h0Mk",
        set:(v) => v = ""? "https://unsplash.com/photos/coastal-road-along-bay-at-golden-hour-7yf4-H-h0Mk": v,
    },
    price:Number,
    location:String,
    country:String
});

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;