import { Document,Types } from "mongoose";

interface IAdmin extends Document{
  username: string;
  password: string;
  name: string;
  dob: Date;
  phoneNumber: string;
  phoneNumbers: Array<string>;
  email: string;
  emails: Array<string>;
  aadhar: Number;
  pan: string;
  address: string;
  reference: Types.ObjectId | undefined;
}
export default IAdmin