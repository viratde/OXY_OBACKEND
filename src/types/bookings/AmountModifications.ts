import { Types } from "mongoose"
import IManager from "../managers/manager"

interface IAmountModification {
    from: {
        amount: number,
        convenienceFee: number
    },
    to: {
        amount: number,
        convenienceFee: number
    },
    date: Date,
    by: Types.ObjectId | IManager
}

export default IAmountModification