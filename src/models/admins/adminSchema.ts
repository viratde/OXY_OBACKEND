import mongoose from "mongoose";
import IAdmin from "../../types/admins/admin";

const adminSchema = new mongoose.Schema<IAdmin>({
  username: {
    type: String,
    required: true,
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
    type: Date,
    required: true,
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
  },
  emails: {
    type: [String],
    defaul: [],
  },
  aadhar: {
    type: Number,
    required: true,
  },
  pan: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required:true
  },
  reference: {
    type: mongoose.Types.ObjectId,
    ref: "admins",
  },
});

const Admin = mongoose.model<IAdmin>("admins", adminSchema);
export default Admin
