import { Model, Types } from "mongoose";
import IBooking from "../../types/bookings/booking";

async function bookingCheckInsFinder(
  model: Model<IBooking>,
  startDay: string,
  endDay: string,
  hotelIds: Array<Types.ObjectId>
): Promise<Array<IBooking>> {


  return (await model.aggregate([
    {
      $match: {
        hotelId: {
          $in: hotelIds,
        },
        isCancelled: false,
        hasNotShown: false,
        hasCheckedIn: true,
      },
    },
    {
      $addFields: {
        startTime: {
          $dateFromString: {
            dateString: {
              $concat: [startDay, "T", "$hotelCheckInTime"]
            },
            format: "%d-%m-%YT%H-%M",
            timezone: "$timezone",
          },
        },
        endTime: {
          $dateFromString: {
            dateString: {
              $concat: [endDay, "T", "$hotelCheckOutTime"],
            },
            format: "%d-%m-%YT%H-%M",
            timezone: "$timezone",
          },
        },
      },
    },
    {
      $match: {
        $expr: {
          $and: [
            {
              $gte: ["$checkInTime", "$startTime"],
            },
            {
              $lt: ["$checkInTime", "$endTime"],
            },
          ],
        },
      },
    },
  ])).map((book) => book as IBooking);
}

export default bookingCheckInsFinder