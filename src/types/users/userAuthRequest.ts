import { Request } from "express"
import IUser from "./user"

interface UserAuthRequest extends Request{
    decodedData:IUser
}

export default UserAuthRequest