import { Types } from "mongoose"
import IManager from "../managers/manager"

interface INoShow{
    date:Date;
    noShownBy: Types.ObjectId | IManager;
    note:string
}

export default INoShow