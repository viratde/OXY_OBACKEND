import { Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string | undefined;
  phoneNumber: string;
  gender: string | undefined;
  dob: string | undefined;
  fcmToken: string | undefined;
  isCreatedByManager : boolean;
  createdAt:Date
}

export default IUser;