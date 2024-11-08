import { Model, Types } from "mongoose";
import IBooking from "../../types/bookings/booking";


async function revenueReconcilationBookingsFinder(
  model: Model<IBooking>,
  startDay: string,
  endDay: string,
  hotelIds: Array<Types.ObjectId>
): Promise<Array<IBooking>> {
  return (
    await model.aggregate([
      {
        $match: {
          isCancelled: false,
          hasNotShown: false,
          hasCheckedIn:true,
          hotelId: {
            $in: hotelIds,
          },
        },
      },
      {
        $addFields: {
          checkInEndTime: {
            $dateFromString: {
              dateString: {
                $concat: [endDay, "T", "$hotelCheckInTime"],
              },
              format: "%d-%m-%YT%H-%M",
              timezone: "$timezone",
            },
          },
          checkOutStartTime: {
            $dateFromString: {
              dateString: {
                $concat: [startDay, "T", "$hotelCheckOutTime"],
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
                $lt: ["$checkIn", "$checkInEndTime"],
              },
              {
                $gt: ["$checkOut", "$checkOutStartTime"],
              },
            ],
          },
        },
      },
    ])
  ).map((book) => book as IBooking);
}

export default revenueReconcilationBookingsFinder;
