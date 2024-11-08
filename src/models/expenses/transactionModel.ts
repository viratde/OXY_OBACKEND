
import mongoose from "mongoose"
import IHotelTransactions from "../../types/expenses/transactions/HotelTransctions"

const hotelTransactionModel = new mongoose.Schema<IHotelTransactions>({
    type: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
    },
    entityRefId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    expenseRefId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    sourceRef: {
        type: mongoose.Schema.Types.ObjectId,
    },
    expenseId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
})

const HotelTransction = mongoose.model("hotelTransactions", hotelTransactionModel)

export default HotelTransction