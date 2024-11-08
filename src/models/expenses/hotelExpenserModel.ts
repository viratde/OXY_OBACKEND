import mongoose from "mongoose";
import IExpenser from "../../types/expenses/expensers/expenser";

const hotelExpenserSchema = new mongoose.Schema<IExpenser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    aadhar: {
        type: Number,
        required: true,
        unique: true
    },
    pan: {
        type: String,
        // required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    },
    id: {
        type: String,
        required: true,
        unique: true
    },
    entities: {
        type: [mongoose.Schema.Types.ObjectId],
        required:true
    }
})

const HotelExpenser = mongoose.model("hotelExpensers", hotelExpenserSchema)

export default HotelExpenser