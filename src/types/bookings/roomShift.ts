import IAssignedRoom from "./AssignedRoom"

interface IRoomShift{
    from:IAssignedRoom,
    to:IAssignedRoom,
    date:Date
}

export default IRoomShift