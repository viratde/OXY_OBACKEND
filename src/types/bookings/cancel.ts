import { Types } from "mongoose";
import IManager from "../managers/manager";

interface ICancel{
    date:Date,
    isCancelledByUser:boolean,
    cancelledBy: Types.ObjectId | null | IManager
}

export default ICancel