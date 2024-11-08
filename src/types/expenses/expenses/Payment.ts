import { Types } from "mongoose"

interface IPayment {
    transId: Types.ObjectId[],
    sourceId: Types.ObjectId,
    value: number,
    note: string,
    by: Types.ObjectId,
    at: Date
}

export default IPayment