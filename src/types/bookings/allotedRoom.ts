interface IAllotedRoom{
  roomType:string,
  noOfRooms:number,
  noOfGuests:Array<number>,
  startDate: Date;
  endDate: Date;
}

export default IAllotedRoom;
