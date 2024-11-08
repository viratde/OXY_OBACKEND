import mongoose from "mongoose";
import IReview from "../../types/hotels/review";

const reviewSchema = new mongoose.Schema<IReview>({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  ratingLevel: {
    type: Number,
    required: true,
  },
  ratingNote: {
    type: String,
  },
  date: {
    type: Date,
  },
  bookingId: {
    type: String,
    required: true,
  },
});

const Review = mongoose.model<IReview>("reviews", reviewSchema);

export default Review;
