import mongoose from "mongoose";
import IUser from "../../types/users/user";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },
    dob: {
      type: String,
    },
    fcmToken: {
      type: String,
    },
    isCreatedByManager: {
      type: Boolean,
      required: true,
      default: false,
    },
    createdAt: {
      type: Date
    }
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("users", userSchema);

export default User;
