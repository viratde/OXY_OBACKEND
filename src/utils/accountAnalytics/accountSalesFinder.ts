import { Model, Types } from "mongoose";
import IBooking from "../../types/bookings/booking";

async function accountSalesFinder(
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
          $or: [
            {
              $expr: {
                $and: [
                  { $gte: ["$createdAt", "$startTime"] },
                  { $lt: ["$createdAt", "$endTime"] },
                ],
              },
            },
            {
              $expr: {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: "$extraCharges",
                        as: "extraCharge",
                        cond: {
                          $and: [
                            { $gte: ["$$extraCharge.date", "$startTime"] },
                            { $lt: ["$$extraCharge.date", "$endTime"] },
                          ],
                        },
                      },
                    },
                  },
                  0,
                ],
              },
            },
          ],
        },
      },
    ])
  ).map((book) => book as IBooking);
}

export default accountSalesFinder;
