import { Document, Types } from "mongoose"
import IHotel from "../hotels/hotel"

interface IPrice extends Document {
    hotelId: Types.ObjectId | IHotel,
    pax1Price: number,
    pax2Price: number,
    pax3Price: number,
    startTime: Date,
    endTime: Date,
    roomType:string
}

export default IPrice