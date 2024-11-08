import { Types } from "mongoose"
import IHotel from "./hotel"
import IManager from "../managers/manager"
import { Document } from "mongoose"

interface IPartner extends Document {
    id: Types.ObjectId | IHotel,
    partnerId: Types.ObjectId | IHotel,
    XBR: number,
    OBR: number,
    CFEE: number,
    XECR: number,
    OECR: number,
    GST:number,
    by: Types.ObjectId | IManager,
    at: Date,
    sDate: Date,
    eDate: Date,
    timeline: string,
    isProfitSharing: boolean,
    isRelative:boolean
}

export default IPartner