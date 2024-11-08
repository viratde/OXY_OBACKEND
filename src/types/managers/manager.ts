import { Types, Document } from "mongoose";
import IPermission from "./permission";

interface IManager extends Document {
    username: string;
    password: string;
    name: string;
    dob: string;
    phoneNumber: string;
    phoneNumbers: Array<string>;
    email: string;
    emails: Array<string>;
    aadhar: Number;
    pan: string;
    gstNo: string,
    businessName: string,
    address: string;
    reference: Types.ObjectId | undefined;
    permissions: Array<IPermission>;
    fcmToken: string | undefined;
    taskToken: string | undefined;
    did: string | undefined;
    department?: {
        name: string,
        bookingShort: string
    }
}

export default IManager