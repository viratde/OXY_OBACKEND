import { Document, Types } from "mongoose"
import IPayment from "./Payment"


interface IExpense extends Document {
    partnerRefId: Types.ObjectId,
    entityRefId: Types.ObjectId,
    amount: number,
    breakup: {
        [key: string]: number
    },
    createdBy: Types.ObjectId,
    approvedBy: Types.ObjectId | undefined,
    createdAt: Date,
    approvedAt: Date | undefined,
    isApproved: boolean,
    isNotApproved: boolean,
    isPaid: boolean,
    isAdvance: boolean,
    isAdvanceCleared: boolean,
    wasAdvance: boolean,
    approvalNote: string,
    note: string,
    id: string,
    timeline: string,
    category: string,
    payment: IPayment[],
    isEntity: boolean,
    isExchange: boolean,
    isExpenserToBusinessLoan: boolean,
    isParentCompanyPayment: boolean,
    cPayment: IPayment[],
    isPayable: boolean
}

export default IExpense