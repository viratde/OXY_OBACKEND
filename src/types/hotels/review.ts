import { Document } from "mongoose";

interface IReview extends Document {
  name: string;
  phoneNumber: string;
  ratingLevel: number;
  ratingNote: string;
  date: Date;
  bookingId: string;
}

export default IReview