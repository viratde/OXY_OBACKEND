import mongoose from "mongoose";
import ILocation from "../../types/admins/Location";


const locationSchema = new mongoose.Schema<ILocation>({
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    distance: {
        type: Number,
        required: true
    },
    locationName: {
        type: String,
        required: true,
    },
})

const Location = mongoose.model("locations", locationSchema)
export default Location