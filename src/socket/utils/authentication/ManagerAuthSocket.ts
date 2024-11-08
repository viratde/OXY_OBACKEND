import { Socket } from "socket.io";
import IManager from "../../../types/managers/manager";

interface IManagerAuthSocket extends Socket{
    decodedData:IManager
}

export default IManagerAuthSocket