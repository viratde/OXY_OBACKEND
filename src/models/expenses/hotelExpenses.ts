import mongoose from "mongoose"
import IExpense from "../../types/expenses/expenses/expense"

const hotelExpenseSchema = new mongoose.Schema<IExpense>({
    partnerRefId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    entityRefId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    breakup: {
        type: Object,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
    },
    approvedAt: {
        type: Date,
    },
    isApproved: {
        type: Boolean,
        required: true
    },
    isNotApproved: {
        type: Boolean,
        required: true
    },
    isAdvance: {
        type: Boolean,
        required: true
    },
    wasAdvance: {
        type: Boolean,
        required: true
    },
    isAdvanceCleared: {
        type: Boolean,
        required: true
    },
    isEntity: {
        type: Boolean,
        required: true
    },
    isPaid: {
        type: Boolean,
        required: true
    },
    approvalNote: {
        type: String
    },
    note: {
        type: String,
        required: true
    },
    id: {
        type: String,
        unique: true,
        required: true
    },
    timeline: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true
    },
    payment: {
        type: [Object],
        default: [],
        required: true
    },
    isExchange: {
        type: Boolean,
        default: false,
        required: true
    },
    cPayment: {
        type: [Object],
        default: [],
        required: true
    },
    isExpenserToBusinessLoan: {
        type: Boolean,
        default: false,
        required: true
    },
    isParentCompanyPayment: {
        type: Boolean,
        default: false,
        required: true
    },
    isPayable: {
        type: Boolean,
        default: false,
        required: false
    }
})

const HotelExpense = mongoose.model("hotelExpenses", hotelExpenseSchema)

export default HotelExpense