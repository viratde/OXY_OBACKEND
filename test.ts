import util from "util"
import getLatLngFromPlaceId from "./src/utils/nUserActions/getLatLngFromPlaceId"
import getUserBookings from "./src/utils/nUserActions/getUserBookings"
import { Types } from "mongoose"

const test = async () => {

    const data = await getUserBookings(
        new Types.ObjectId("666b4344cd20db7c3054a274"),
        1,
        1
    )
    console.log(util.inspect(data, { depth: null }))

}

export default test


// {
//     from: "bookings",
//     let: {
//       userId: {
//         $toString: "$_id"
//       },
//       createdAt: "$createdAt"
//     },
//     pipeline: [
//       {
//         $match: {
//           isCancelled: false,
//           hasNotShown: false,
//           hasCheckedIn: true,
//           userId: new ObjectId("$$userId")
//           // createdAt:"$$createdAt",
//         }
//       },
//       {
//         $limit: 1
//       },
//       {
//         $addFields: {
//           created: "$$userId"
//         }
//       }
//       // {
//       //   $lookup: {
//       //     from: "hotels",
//       //     localField: "hotelId",
//       //     foreignField: "_id",
//       //     as: "hotelId"
//       //   }
//       // },
//       // {
//       //   $unwind: "$hotelId"
//       // },
//       // {
//       //   $addFields: {
//       //     hotelId: "$hotelId.hotelName"
//       //   }
//       // },
//       // {
//       //   $addFields: {
//       //     fCheckIn: {
//       //       $dateToString: {
//       //         date: "$checkIn",
//       //         format: "%d-%b-%Y",
//       //         timezone: "$timezone"
//       //       }
//       //     },
//       //     fCheckOut: {
//       //       $dateToString: {
//       //         date: "$checkOut",
//       //         format: "%d-%b-%Y",
//       //         timezone: "$timezone"
//       //       }
//       //     }
//       //   }
//       // },
//       // {
//       //   $project: {
//       //     bookingId: 1,
//       //     bookedRooms: 1,
//       //     name: 1,
//       //     phoneNumber: 1,
//       //     amount: 1,
//       //     hotelId: 1,
//       //     fCheckIn: 1,
//       //     fCheckOut: 1,
//       //     hasCheckedOut: 1
//       //   }
//       // }
//     ],
//     as: "bookings"
//   }