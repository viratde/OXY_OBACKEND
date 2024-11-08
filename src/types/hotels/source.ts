import { Types } from "mongoose"

interface ISource {
    id: Types.ObjectId[],
    name: string,
    by: Types.ObjectId,
    at: Date,
    value:number
}

export default ISource