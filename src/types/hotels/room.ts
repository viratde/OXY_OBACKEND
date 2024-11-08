import { Document } from "mongoose";

interface IRoom extends Document{
  roomNo: string;
  roomType: string;
  features: Array<string>;
}
export default IRoom