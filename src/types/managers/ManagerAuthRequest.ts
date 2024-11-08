import { Request } from "express"
import IManager from "./manager"


interface ManagerAuthRequest extends Request{
    decodedData:IManager
}

export default ManagerAuthRequest