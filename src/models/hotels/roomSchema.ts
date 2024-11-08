import mongoose from "mongoose";
import IRoom from "../../types/hotels/room";

export const roomRepresentSchema = new mongoose.Schema<IRoom>({
  roomNo: {
    type: String,
  },
  roomType: {
    type: String,
    required: true,
  },
  features: {
    type: [String],
    default: [],
  },
});

const Room = mongoose.model<IRoom>("rooms",roomRepresentSchema)
export default Room
