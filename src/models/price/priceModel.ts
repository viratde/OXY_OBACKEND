import mongoose, { Types } from "mongoose";
import IPrice from "../../types/price/price";


const priceModel = new mongoose.Schema<IPrice>({
    hotelId: {
        type: Types.ObjectId,
        ref: "Hotels"
    },
    pax1Price: {
        type: Number,
        required: true
    },
    pax2Price: {
        type: Number,
        required: true
    },
    pax3Price: {
        type: Number,
        required: true
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true
    },
    roomType:{
        type:String,
        required:true
    }
})

const Price = mongoose.model<IPrice>("Price", priceModel)
export default Price