import { Types } from "mongoose";
import IManager from "../managers/manager";

interface IDeletedPayment {
    cash: number;
    bank: number;
    ota: number;
    total: number,
    date: Date,
    by: Types.ObjectId | IManager,
    colId: string,
    deletedBy: Types.ObjectId | IManager,
    deletedDate:Date,
}

export default IDeletedPayment