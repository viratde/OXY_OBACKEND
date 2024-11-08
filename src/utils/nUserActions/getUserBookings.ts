import { Types } from "mongoose"
import Bookings from "../../models/bookings/bookingModel"



const getUserBookings = async (
    userId: Types.ObjectId,
    count: number,
    page: number
) => {



    const bookings = await Bookings.aggregate([
        {
            $match: {
                userId: userId
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $skip:(page - 1) * count
        },
        {
            $limit:count
        },
        {
            $lookup: {
                from: "hotels",
                localField: "hotelId",
                foreignField: "_id",
                as: "hotelId"
            }
        },
        {
            $unwind: "$hotelId"
        },
        {
            $addFields: {
                hotelId: "$hotelId._id",
                hotelName: "$hotelId.hotelName",
                shortAddress: "$hotelId.hotelAddress",
                contact:"$hotelId.phoneNo"
            }
        },
        {
            $project: {
                createdAt: 1,
                hotelName: 1,
                shortAddress: 1,
                checkIn: {
                    $dateToString: {
                        date: "$actualCheckIn",
                        format: "%d %b %Y (%H:%M)",
                        timezone: "$timezone"
                    }
                },
                checkOut: {
                    $dateToString: {
                        date: "$actualCheckOut",
                        format: "%d %b %Y (%H:%M)",
                        timezone: "$timezone"
                    }
                },
                bookingId: "$bookingId",
                hasNotShown: "$hasNotShown",
                isCancelled: "$isCancelled",
                hasCheckedIn: "$hasCheckedIn",
                hasCheckedOut: "$hasCheckedOut",
                amount: "$amount",
                bookingAmount: "$bookingAmount",
                extraCharges: {
                    $map: {
                        input: "$extraCharges",
                        as: "ecr",
                        in: {
                            type: "$$ecr.type",
                            amount: "$$ecr.revenueAmount"
                        }
                    }
                },
                contact:"$contact",
                _id:0,
                bookedRooms:"$bookedRooms",
                code:"$actionCode"
            }
        }
    ])

    return bookings

}

export default getUserBookings