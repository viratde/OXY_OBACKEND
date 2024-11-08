import { Request, Response } from "express";
import Hotel from "../../models/hotels/hotelModel";
import UserAuthRequest from "../../types/users/userAuthRequest";
import moment from "moment";
import Review from "../../models/hotels/reviewModel";
import IReview from "../../types/hotels/review";

const userPostReviewController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const decodedData = (req as UserAuthRequest).decodedData;
    const hotelId = req.body.hotelId;
    const ratingNote = req.body.ratingNote;
    const ratingValue = req.body.ratingValue;
    const bookingId = req.body.bookingId;
    const hotel = await Hotel.findOne({ _id: hotelId });

    if (ratingNote.length <= 0) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct review note" });
    }

    if (ratingValue < 0 && ratingValue > 5) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct review" });
    }

    if (!hotel) {
      return res
        .status(400)
        .json({ status: false, message: "Please choose correct hotel" });
    }

    const review = new Review({
      name: decodedData.name,
      phoneNumber: decodedData.phoneNumber,
      ratingLevel: ratingValue as number,
      ratingNote: ratingNote as string,
      bookingId: bookingId as string,
      date: moment(new Date()).toDate(),
    });

    hotel.rating = (((hotel.rating * hotel.noOfReviews) + ratingValue) / (hotel.noOfReviews + 1))
    hotel.reviews.push(review as IReview);
    hotel.noOfReviews = hotel.noOfReviews + 1
    await review.save();
    await hotel.save();

    return res
      .status(200)
      .json({ status: true, message: "Rated Successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default userPostReviewController;
