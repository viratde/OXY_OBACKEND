import { ExtendedError } from "socket.io/dist/namespace";
import jwt from "jsonwebtoken"
import Manager from "../../../models/managers/managerSchema";
import IManagerAuthSocket from "./ManagerAuthSocket";

const managerSocketAuthentication = async (
    socket: IManagerAuthSocket,
    next: (err?: ExtendedError | undefined) => void
) => {
    if (socket.handshake.query && socket.handshake.query.token) {
        const data = jwt.verify(socket.handshake.query.token as string, process.env.JWT_TOKEN as string);

        if (typeof data == "string") {
            return next(new Error("Please login again."))
        }
        if (!data.managerId) {
            return next(new Error("Please login again."))
        }

        const manager = await Manager.findOne({ _id: data.managerId });
        if (!manager) {
            return next(new Error("Please login again."))
        }
        socket.decodedData = manager
        next()
    }
    else {
        return next(new Error("Please login again."))
    }
};

export default managerSocketAuthentication
