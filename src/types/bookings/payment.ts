import { Types } from "mongoose";
import IManager from "../managers/manager";

interface IPayment {
    cash: number;
    bank: number;
    ota: number;
    total: number,
    date: Date,
    by: Types.ObjectId | IManager,
    colId: string,
    curDate: Date,
    transaction?: TransactionData
}

interface TransactionData {
    method: string,
    isVerified: boolean,
    txnId: string,
    paymentMode:string,
    data?:any
}


export default IPayment