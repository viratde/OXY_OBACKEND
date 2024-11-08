import { Model, Types } from "mongoose";
import IBooking from "../../types/bookings/booking";


async function collectionConcilationBookingsFinder(
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
          hotelId: {
            $in: hotelIds,
          },
          isPaymentCollected: true,
          hasCheckedIn:true,
        },
      },
      {
        $addFields: {
          endTime: {
            $dateFromString: {
              dateString: {
                $concat: [endDay, "T", "00-00"],
              },
              format: "%d-%m-%YT%H-%M",
              timezone: "$timezone",
            },
          },
          startTime: {
            $dateFromString: {
              dateString: {
                $concat: [startDay, "T", "00-00"],
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
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$collections",
                    as: "collection",
                    cond: {
                      $and: [
                        { $gte: ["$$collection.date", "$startTime"] },
                        { $lt: ["$$collection.date", "$endTime"] },
                      ],
                    },
                  },
                },
              },
              0,
            ],
          },
        },
      },
    ])
  ).map((book) => book as IBooking);
}

export default collectionConcilationBookingsFinder
