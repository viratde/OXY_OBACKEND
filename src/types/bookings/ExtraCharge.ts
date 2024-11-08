import { Types } from "mongoose"
import IManager from "../managers/manager"

interface IExtraCharge{
    date:Date;
    revenueDate:Date;
    revenueAmount:number;
    addedBy:Types.ObjectId | IManager;
    note:string;
    type:ExtraChargeTypes;
    extendedTime:number | undefined,
    ecId:string
}



export enum ExtraChargeTypes{
    EarlyCheckIn = "EarlyCheckIn",
    LateCheckOut = "LateCheckOut",
    ExtraPersonCharge = "ExtraPersonCharge",
    ExtraMealCharge = "ExtraMealCharge",
    Others = "Others"
}

export default IExtraCharge