import mongoose from "mongoose";
import IManager from "../../types/managers/manager";

const managerSchema = new mongoose.Schema<IManager>({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  phoneNumbers: {
    type: [String],
    defaul: [],
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  emails: {
    type: [String],
    defaul: [],
  },
  aadhar: {
    type: Number,
  },
  pan: {
    type: String,
  },
  gstNo: {
    type: String,
  },
  businessName: {
    type: String,
  },
  address: {
    type: String,
  },
  permissions: [Object],
  reference: {
    type: mongoose.Types.ObjectId,
    ref: "admins",
  },
  fcmToken: {
    type: String
  },
  taskToken: {
    type: String,
  },
  did: {
    type: String
  },
  department: {
    type: Object,
  }
});

const Manager = mongoose.model<IManager>("managers", managerSchema);
export default Manager
