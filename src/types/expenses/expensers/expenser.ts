import { Types } from "mongoose";
import IManager from "../../managers/manager";
import IHotel from "../../hotels/hotel";

interface IExpenser {
    name: string,
    phoneNumber: string | undefined,
    email: string | undefined,
    aadhar: number | undefined,
    pan: string | undefined,
    createdBy: Types.ObjectId | IManager,
    isActive: boolean,
    id: string,
    entities: (Types.ObjectId[] | IHotel[])
}

export default IExpenser