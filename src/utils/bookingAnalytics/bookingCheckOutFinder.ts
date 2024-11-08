import { Model, Types } from "mongoose";
import IBooking from "../../types/bookings/booking";

async function bookingCheckOutFinder(
  model: Model<IBooking>,
  startDay: string,
  endDay: string,
  hotelIds: Array<Types.ObjectId>
): Promise<Array<IBooking>> {
  return (
    await model.aggregate([
      {
        $match: {
          hotelId: {
            $in: hotelIds,
          },
          isCancelled: false,
          hasNotShown: false,
          hasCheckedIn: true,
          hasCheckedOut: true,
        },
      },
      {
        $addFields: {
          startTime: {
            $dateFromString: {
              dateString: {
                $concat: [startDay, "T", "$hotelCheckOutTime"],
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
                $gte: ["$checkOut", "$startTime"],
              },
              {
                $lt: ["$checkOut", "$endTime"],
              },
            ],
          },
        },
      },
    ])
  ).map((book) => book as IBooking);
}

export default bookingCheckOutFinder;
