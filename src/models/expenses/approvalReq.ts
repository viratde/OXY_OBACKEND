import mongoose, { Types } from "mongoose";
import ApprovalReq from "../../types/expenses/expenses/ApprovalReq";

const approvalReqSchema = new mongoose.Schema<ApprovalReq>({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    expenserId: {
        type: String,
        required: true,
    },
    expenserRef: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    amount:{
        type:Number,
        required:true
    },
    note:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        required:true
    },
    action:{
        type:Boolean,
        default:false,
    },
    actionTaken:{
        default:false,
        type:Boolean
    }
})

const ApprovalRequest = mongoose.model("approvalReqs",approvalReqSchema)

export default ApprovalRequest