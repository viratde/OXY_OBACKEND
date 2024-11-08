import { Types } from "mongoose";


interface ApprovalReq {
    hotelId: Types.ObjectId,
    expenserId: string,
    expenserRef: Types.ObjectId,
    amount: number,
    note: string,
    createdAt:Date,
    actionTaken:boolean,
    action:boolean
}

export default ApprovalReq