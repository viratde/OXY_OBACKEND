import { Types } from "mongoose"
import IManager from "../managers/manager"
import { ExtraChargeTypes } from "./ExtraCharge";

interface IDeletedExtraCharge{
    date:Date;
    revenueDate:Date;
    revenueAmount:number;
    addedBy:Types.ObjectId | IManager;
    note:string;
    type:ExtraChargeTypes;
    extendedTime:number | undefined,
    ecId:string,
    deletedBy: Types.ObjectId | IManager,
    deletedDate:Date
}

export default IDeletedExtraCharge