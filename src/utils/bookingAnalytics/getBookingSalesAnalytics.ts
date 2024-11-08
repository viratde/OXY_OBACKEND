import moment from "moment-timezone";
import { Types } from "mongoose";
import Bookings from "../../models/bookings/bookingModel";
import IBookingAnalyticsBookingFormat from "./bookingAnalyticsBookingFormat";
import { BookingSourcesShort } from "../../enums/BookingSource";
import Hotel from "../../models/hotels/hotelModel";


const getBookingSalesAnalytics = async (
    startDay: string,
    days: number,
    isTable: boolean,
    hotelIds: Array<Types.ObjectId>
) => {

    let startDate = moment.tz(
        `${startDay} 00:00:00`,
        "DD-MM-YYYY HH:mm:ss",
        "UTC"
    );

    let earliestCheckInEndTime = moment.tz(`${startDay} 12:00:00`, "DD-MM-YYYY HH:mm:ss", "Asia/Kolkata").add(days, "day").add(12, "hour")
    let latestCheckOutStartDate = moment.tz(`${startDay} 11:00:00`, "DD-MM-YYYY HH:mm:ss", "Asia/Kolkata").subtract(12, "hour")

    let allDays = [startDate.format("DD-MM-YYYY")];

    for (let i = 1; i < days; i++) {
        allDays.push(startDate.clone().add(i, "day").format("DD-MM-YYYY"));
    }

    let aggregation = [
        {
            $match: {
                isCancelled: false,
                hasNotShown: false,
                hasCheckedIn: true,
                checkIn: {
                    $lt: earliestCheckInEndTime.toDate(),
                },
                checkOut: {
                    $gt: latestCheckOutStartDate.toDate(),
                },
                hotelId: {
                    $in: hotelIds
                }
            }
        },
        {
            $project: {
                checkOut: 1,
                checkIn: 1,
                canStayCheckIn: 1,
                bookedRooms: 1,
                timezone: 1,
                hotelId: 1,
                bookingSource: 1,
                name: 1,
                phoneNumber: 1,
                amount: 1,
                bookingId: 1
            }
        },
        {
            $addFields: {
                noOfDays: {
                    $ceil: {
                        $divide: [
                            {
                                $subtract: [
                                    {
                                        $toLong: "$checkOut",
                                    },
                                    {
                                        $toLong: "$checkIn",
                                    },
                                ],
                            },
                            24 * 60 * 60 * 1000,
                        ],
                    },
                }
            }
        },
        {
            $addFields: {
                noOfRooms: {
                    $sum: {
                        $map: {
                            input: {
                                $objectToArray: "$bookedRooms",
                            },
                            as: "room",
                            in: {
                                $size: "$$room.v",
                            },
                        },
                    },
                },
            },

        },
        {
            $project: {
                bookedRooms: 0
            }
        },
        {
            $addFields: {
                fakeDaysRange: {
                    $cond: {
                        if: { $eq: ["$noOfDays", 1] },
                        then: [0],
                        else: {
                            $range: [0, "$noOfDays", 1],
                        },
                    },
                },
            }
        },
        {
            $addFields: {
                accountingDates: {
                    $map: {
                        input: "$fakeDaysRange",
                        as: "day",
                        in: {
                            $dateToString: {
                                date: {
                                    $toDate: {
                                        $add: [
                                            {
                                                $multiply: [
                                                    "$$day",
                                                    24 * 60 * 60 * 1000,
                                                ],
                                            },
                                            { $toLong: "$canStayCheckIn" },
                                        ],
                                    },
                                },
                                format: "%d-%m-%Y",
                                timezone: "$timezone"
                            },
                        },
                    },
                },
            }
        },
        {
            $project:{
                canStayCheckIn:0
            }
        },
        {
            $unwind: {
                path: "$accountingDates",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $match: {
                accountingDates: {
                    $in: allDays
                }
            }
        },
        {
            $addFields: {
                fCheckIn: {
                    $dateToString: {
                        date: "$checkIn",
                        format: "%d-%b-%Y",
                        timezone: "$timezone"
                    }
                },
                fCheckOut: {
                    $dateToString: {
                        date: "$checkOut",
                        format: "%d-%b-%Y",
                        timezone: "$timezone"
                    }
                }
            }
        },
        {
            $project: {
                checkIn: 0,
                checkOut: 0
            }
        },
        {
            $group: {
                _id: {
                    hotel: {
                        $toString:"$hotelId"
                    },
                    date: "$accountingDates",
                    bookingSource: {
                        $toUpper: {
                            $substrBytes: [
                                "$bookingSource",
                                0,
                                2
                            ]
                        }
                    },
                },
                bookings: {
                    $push: {
                        bookingId: "$bookingId",
                        rooms: "$noOfRooms",
                        name: "$name",
                        phoneNumber: "$phoneNumber",
                        amount: "$amount",
                        status: {
                            $cond: [
                                "$hasCheckedOut",
                                "Checked Out",
                                "Checked In"
                            ]
                        },
                        stay: {
                            $cond: [
                                {
                                    $eq: [
                                        {
                                            $substrBytes: [
                                                "$fCheckIn",
                                                2,
                                                10
                                            ]
                                        },
                                        {
                                            $substrBytes: [
                                                "$fCheckOut",
                                                2,
                                                10
                                            ]
                                        }
                                    ]
                                },
                                {
                                    $concat: [
                                        {
                                            $substrBytes: ["$fCheckIn", 0, 2],
                                        },
                                        " - ",
                                        {
                                            $substrBytes: ["$fCheckOut", 0, 6],
                                        },
                                    ]
                                },
                                {
                                    $cond: [
                                        {
                                            $eq: [
                                                {
                                                    $substrBytes: [
                                                        "$fCheckIn",
                                                        6,
                                                        10
                                                    ]
                                                },
                                                {
                                                    $substrBytes: [
                                                        "$fCheckOut",
                                                        6,
                                                        10
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            $concat: [
                                                {
                                                    $substrBytes: ["$fCheckIn", 0, 6],
                                                },
                                                " - ",
                                                {
                                                    $substrBytes: ["$fCheckOut", 0, 6],
                                                },
                                            ]
                                        },
                                        {
                                            $concat: [
                                                "$fCheckIn",
                                                " - ",
                                                "$fCheckOut"
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                },
            }
        },
        {
            $group: {
                _id: {
                    hotel: "$_id.hotel",
                    date: "$_id.date",
                },
                bookingsArray: {
                    $push: {
                        source: "$_id.bookingSource",
                        count: "$bookings"
                    }
                }
            }
        },
        {
            $addFields: {
                bookings: {
                    $arrayToObject: {
                        $map: {
                            input: "$bookingsArray",
                            as: "booking",
                            in: {
                                k: "$$booking.source",
                                v: "$$booking.count"
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                bookingsArray: 0
            }
        },
        {
            $group: {
                _id: "$_id.hotel",
                datesArray: {
                    $push: {
                        date: "$_id.date",
                        bookings: "$bookings"
                    }
                }
            }
        },
        {
            $addFields: {
                dateData: {
                    $arrayToObject: {
                        $map: {
                            input: "$datesArray",
                            as: "dateData",
                            in: {
                                k: "$$dateData.date",
                                v: "$$dateData.bookings"
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                datesArray: 0
            }
        },
        {
            $group: {
                _id: "all",
                allData: {
                    $push: {
                        hotel: "$_id",
                        dateData: "$dateData"
                    }
                }
            }
        },
        {
            $project: {
                data: {
                    $arrayToObject: {
                        $map: {
                            input: "$allData",
                            as: "hotelData",
                            in: {
                                k: "$$hotelData.hotel",
                                v: "$$hotelData.dateData"
                            }
                        }
                    }
                }
            }
        }
    ]





    let tAggregation = [
        {
            $match: {
                isCancelled: false,
                hasNotShown: false,
                hasCheckedIn: true,
                checkIn: {
                    $lt: earliestCheckInEndTime.toDate(),
                },
                checkOut: {
                    $gt: latestCheckOutStartDate.toDate(),
                },
                hotelId: {
                    $in: hotelIds
                }
            }
        },
        {
            $project: {
                checkOut: 1,
                checkIn: 1,
                canStayCheckIn: 1,
                bookedRooms: 1,
                timezone: 1,
                hotelId: 1,
                bookingSource: 1
            }
        },
        {
            $addFields: {
                noOfDays: {
                    $ceil: {
                        $divide: [
                            {
                                $subtract: [
                                    {
                                        $toLong: "$checkOut",
                                    },
                                    {
                                        $toLong: "$checkIn",
                                    },
                                ],
                            },
                            24 * 60 * 60 * 1000,
                        ],
                    },
                }
            }
        },
        {
            $project: {
                checkIn: 0,
                checkOut: 0
            }
        },
        {
            $addFields: {
                noOfRooms: {
                    $sum: {
                        $map: {
                            input: {
                                $objectToArray: "$bookedRooms",
                            },
                            as: "room",
                            in: {
                                $size: "$$room.v",
                            },
                        },
                    },
                },
            },
        },
        {
            $project: {
                bookedRooms: 0
            }
        },
        {
            $addFields: {
                fakeDaysRange: {
                    $cond: {
                        if: { $eq: ["$noOfDays", 1] },
                        then: [0],
                        else: {
                            $range: [0, "$noOfDays", 1],
                        },
                    },
                },
            }
        },
        {
            $addFields: {
                accountingDates: {
                    $map: {
                        input: "$fakeDaysRange",
                        as: "day",
                        in: {
                            $dateToString: {
                                date: {
                                    $toDate: {
                                        $add: [
                                            {
                                                $multiply: [
                                                    "$$day",
                                                    24 * 60 * 60 * 1000,
                                                ],
                                            },
                                            { $toLong: "$canStayCheckIn" },
                                        ],
                                    },
                                },
                                format: "%d-%m-%Y",
                                timezone: "$timezone"
                            },
                        },
                    },
                },
            }
        },
        {
            $project:{
                canStayCheckIn:0
            }
        },
        {
            $unwind: {
                path: "$accountingDates",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $match: {
                accountingDates: {
                    $in: allDays
                }
            }
        },
        {
            $group: {
                _id: {
                    hotel: {
                        $toString:"$hotelId"
                    },
                    date: "$accountingDates",
                    bookingSource: {
                        $toUpper: {
                            $substrBytes: [
                                "$bookingSource",
                                0,
                                2
                            ]
                        }
                    }
                },
                bookings: {
                    $sum: "$noOfRooms"
                },
            }
        },
        {
            $group: {
                _id: {
                    hotel: "$_id.hotel",
                    date: "$_id.date",
                },
                bookingsArray: {
                    $push: {
                        source: "$_id.bookingSource",
                        count: "$bookings"
                    }
                }
            }
        },
        {
            $addFields: {
                bookings: {
                    $arrayToObject: {
                        $map: {
                            input: "$bookingsArray",
                            as: "booking",
                            in: {
                                k: "$$booking.source",
                                v: "$$booking.count"
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                bookingsArray: 0
            }
        },
        {
            $group: {
                _id: "$_id.hotel",
                datesArray: {
                    $push: {
                        date: "$_id.date",
                        bookings: "$bookings"
                    }
                }
            }
        },
        {
            $addFields: {
                dateData: {
                    $arrayToObject: {
                        $map: {
                            input: "$datesArray",
                            as: "dateData",
                            in: {
                                k: "$$dateData.date",
                                v: "$$dateData.bookings"
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                datesArray: 0
            }
        },
        {
            $group: {
                _id: "all",
                allData: {
                    $push: {
                        hotel: "$_id",
                        dateData: "$dateData"
                    }
                }
            }
        },
        {
            $project: {
                data: {
                    $arrayToObject: {
                        $map: {
                            input: "$allData",
                            as: "hotelData",
                            in: {
                                k: "$$hotelData.hotel",
                                v: "$$hotelData.dateData"
                            }
                        }
                    }
                },
            }
        }
    ]

    const [data, hotels] = await Promise.all([
        Bookings.aggregate(isTable ? tAggregation : aggregation),
        Hotel.find({ _id: { $in: hotelIds } }, { _id: 1, hotelName: 1 })
    ])

    let rData: {
        [key: string]: {
            [key: string]: {
                [key: string]: number | IBookingAnalyticsBookingFormat[]
            }
        }
    } = {}

    for (let i = 0; i < hotels.length; i++) {
        let thatDateData: {
            [key: string]: {
                [key: string]: number | IBookingAnalyticsBookingFormat[]
            }
        } = {}
        for (let j = 0; j < allDays.length; j++) {
            let thatDateTypeData: {
                [key: string]: number | IBookingAnalyticsBookingFormat[]
            } = {}
            for (let k = 0; k < BookingSourcesShort.length; k++) {
                let thatData = undefined
                try {
                    thatData = data[0].data[hotels[i]._id.toString()][allDays[j]][BookingSourcesShort[k]]
                } catch (err) {
                }
                if (thatData) {
                    thatDateTypeData[BookingSourcesShort[k]] = thatData
                } else {
                    thatDateTypeData[BookingSourcesShort[k]] = isTable ? 0 : []
                }
            }
            thatDateData[allDays[j]] = thatDateTypeData
        }
        rData[hotels[i].hotelName] = thatDateData
    }

    return rData


}


export default getBookingSalesAnalytics