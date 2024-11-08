import { Types } from "mongoose"
import IManager from "../managers/manager"

interface ICheckInCheckOut{
    date:Date,
    isQr:boolean,
    by:Types.ObjectId | IManager
}

export default ICheckInCheckOut