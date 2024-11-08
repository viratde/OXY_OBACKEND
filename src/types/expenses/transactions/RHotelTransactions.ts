import { Types } from "mongoose"


interface RHotelTransactions {
    route: {
        entity: Types.ObjectId,
        sourceRef: {
            id: Types.ObjectId,
            amount: number
        }[]
    }[],
    extra?: string,
    by: Types.ObjectId,
    date: Date,
    amount: number
}

export default RHotelTransactions