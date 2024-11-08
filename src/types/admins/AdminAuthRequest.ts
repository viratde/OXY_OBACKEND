import { Request } from "express"
import IAdmin from "./admin"

interface AdminAuthRequest extends Request{
    decodedData: IAdmin
}

export default AdminAuthRequest