import { Model, Types } from "mongoose"
import IBooking from "../../types/bookings/booking"
import moment from "moment-timezone"

const completedBookingsFinder = async (
    model: Model<IBooking>,
    hotelIds: Array<string>,
    date: string
) => {
    let nxtDay = moment.tz(date, "DD-MM-YYYY", "Asia/Kolkata").add(1, "day").format("DD-MM-YYYY")
    return (
        await model.aggregate([
            // {
            //     $match:{
            //         $expr:{
            //             hotelIds:{
            //                 $in:hotelIds
            //             }
            //         }
            //     }
            // },
            {
                $addFields: {
                    startTime: {
                        $dateFromStrig: {
                            dateString: {
                                $concat: [date, "T", "00-00"],
                            },
                            format: "%d-%m-%YT%H-%M",
                            timezone: "$timezone",
                        }
                    },
                    endTime: {
                        $dateFromStrig: {
                            dateString: {
                                $concat: [nxtDay, "T", "00-00"],
                            },
                            format: "%d-%m-%YT%H-%M",
                            timezone: "$timezone",
                        }
                    }
                },
                $match: {
                    $expr: {
                        $or: [
                            {
                                $and: [
                                    {
                                        $gte: ["$actualCheckOut", "$startTime"]
                                    },
                                    {
                                        $lt: ["$actualCheckOut", "$endTime"]
                                    }
                                ]
                            },
                            {
                                $and: [
                                    {
                                        $gte: ["$checkOutTime", "$startTime"]
                                    },
                                    {
                                        $lt: ["$checkOutTime", "$endTime"]
                                    },
                                    {
                                        $match: {
                                            hasCheckedOut: true
                                        }
                                    }
                                ]
                            },
                            {
                                $and: [
                                    {
                                        $gte: ["$cancelledData.date", "$startTime"]
                                    },
                                    {
                                        $lt: ["$cancelledData.date", "$endTime"]
                                    },
                                    {
                                        $match: {
                                            isCancelled: true
                                        }
                                    }
                                ]
                            },
                            {
                                $and: [
                                    {
                                        $gte: ["$noShowData.date", "$startTime"]
                                    },
                                    {
                                        $lt: ["$noShowData.date", "$endTime"]
                                    },
                                    {
                                        $match: {
                                            hasNotShown: true
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        ])
    )
}

export default completedBookingsFinder