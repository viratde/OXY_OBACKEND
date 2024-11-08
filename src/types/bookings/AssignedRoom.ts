import { Types } from "mongoose"
import IManager from "../managers/manager"
import IRoom from "../hotels/room";

interface IAssignedRoom{
    rooms:Array<IRoom> | Array<Types.ObjectId>;
    assignedBy:Types.ObjectId | IManager;
    date:Date
}

export default IAssignedRoom