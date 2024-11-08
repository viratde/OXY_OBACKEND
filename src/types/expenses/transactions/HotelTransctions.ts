import { Types } from "mongoose";
import IEntityTransTypes from "./EntityTransTypes";

interface IHotelTransactions {

    type: IEntityTransTypes,
    date: Date,
    expenseId: string,
    expenseRefId: Types.ObjectId,
    entityRefId: Types.ObjectId,
    sourceRef: Types.ObjectId | undefined,
    amount: number
}

export default IHotelTransactions