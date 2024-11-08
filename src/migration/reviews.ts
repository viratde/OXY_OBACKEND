import hotels from "./hotel.json";

import Hotel from "../models/hotels/hotelModel";
import Room from "../models/hotels/roomSchema";
import IRoom from "../types/hotels/room";
import IReview from "../types/hotels/review";
import Review from "../models/hotels/reviewModel";
import mongoose from "mongoose";
import IHotel from "../types/hotels/hotel";
import Bookings, { CompletedBookings } from "../models/bookings/bookingModel";
import moment from "moment";
import bookingPopulate from "../utils/booking/populateData";


const run = async () => {
  let connection = await mongoose.connect(
    "mongodb://127.0.0.1:27018/OxyTsTestDatabase"
  );
  console.log(
    "Database Connected Successfully at",
    connection.connection.host,
    connection.connection.port
  );
};

run();

const min = 4.1;
const max = 4.8;


async function migrate() {

  const hotels = await Hotel.find()
  console.log(hotels.length)
  for (let i = 0; i < hotels.length; i++) {
    let hotel = hotels[i]
    const booking = await Bookings.find({ hotelId: hotel._id })
    console.log(hotel.reviews.length,booking.length)
    for (let j = 0; j < hotel.reviews.length; i++) {
      let review = await Review.find({_id:hotel.reviews[j]})
      if (!review) {
        let bookingId = booking[Math.floor(Math.random() * booking.length)]
        let review = new Review({
          _id: hotel.reviews[j],
          ratingLevel: Math.random() * (max - min) + min,
          ratingNote: "This hotel provides amazing service",
          bookingId: bookingId.bookingId,
          phoneNumber: bookingId.phoneNumber,
          date: moment().subtract(Math.floor(Math.random() * 60), "day").toDate()
        })
        console.log("saving")
        // await review.save()
      }
    }

  }
}

migrate()