import moment from "moment-timezone";
import { Types } from "mongoose";
import Bookings from "../../models/bookings/bookingModel";
import Hotel from "../../models/hotels/hotelModel";
import { ICollectionAccountAnalyticsBooking } from "./accountAnalyticsBookingFormat";
import { fi } from "@faker-js/faker";

const getBookingCollectionAnalytics = async (
    startDay: string,
    days: number,
    isTable: boolean,
    hotelIds: Array<Types.ObjectId>,
    isHotelId: boolean = false
) => {


    let startDate = moment.tz(`${startDay} 00:00:00`, "DD-MM-YYYY HH:mm:ss", "UTC");

    let startTime = moment.tz(`${startDay} 00:00:00`, "DD-MM-YYYY HH:mm:ss", "Asia/Kolkata").subtract(12, "hour")
    let endTime = moment.tz(`${startDay} 00:00:00`, "DD-MM-YYYY HH:mm:ss", "Asia/Kolkata").add(days, "day").add(12, "hour")

    let allDays = [startDate.format("DD-MM-YYYY")];

    for (let i = 1; i < days; i++) {
        allDays.push(startDate.clone().add(i, "day").format("DD-MM-YYYY"));
    }

    let tAggregation = [
        {
            $match: {
                isCancelled: false,
                hasNotShown: false,
                hotelId: {
                    $in: hotelIds,
                },
                isPaymentCollected: true,
                $expr: {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: "$collections",
                                    as: "collection",
                                    cond: {
                                        $and: [
                                            {
                                                $gte: ["$$collection.date", startTime.toDate()]
                                            },
                                            {
                                                $lte: ["$$collection.date", endTime.toDate()]
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        0
                    ]
                }
            },
        },
        {
            $project: {
                hotelId: 1,
                collections: 1,
                timezone: 1
            }
        },

        {
            $addFields: {
                collections: {
                    $map: {
                        input: "$collections",
                        as: "collection",
                        in: {
                            $cond: {
                                if: {
                                    $not: {
                                        $eq: [
                                            {
                                                $type: "$$collection.transaction"
                                            },
                                            "object",
                                        ]
                                    }
                                },
                                then:"$$collection",
                                else: {
                                    $cond: [
                                        {
                                            $eq: [
                                                "$$collection.transaction.paymentMode",
                                                "CARD"
                                            ]
                                        },
                                        {
                                            $setField: {
                                                field: "TidCARD",
                                                value: "$$collection.total",
                                                input: "$$collection"
                                            }
                                        },
                                        {
                                            $setField: {
                                                field: "TidUPI",
                                                value: "$$collection.total",
                                                input: "$$collection"
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        },

        {
            $unwind: {
                path: "$collections"
            }
        },
        {
            $addFields: {
                colDate: {
                    $dateToString: {
                        date: "$collections.date",
                        format: "%d-%m-%Y",
                        timezone: "$timezone"
                    }
                }
            }
        },
        {
            $group: {
                _id: {
                    hotelName: {
                        $toString: "$hotelId"
                    },
                    date: "$colDate"
                },
                Cash: {
                    $sum: "$collections.cash"
                },
                Bank: {
                    $sum: "$collections.bank"
                },
                Ota: {
                    $sum: "$collections.ota"
                },
                TidCARD: {
                    $sum: "$collections.TidCARD"
                },
                TidUPI: {
                    $sum: "$collections.TidUPI"
                }
            }
        },
        {
            $group: {
                _id: "$_id.hotelName",
                dateArray: {
                    $push: {
                        date: "$_id.date",
                        collections: [
                            {
                                Cash: "$Cash",
                                Bank: "$Bank",
                                Ota: "$Ota",
                                TidCARD: "$TidCARD",
                                TidUPI: "$TidUPI",
                                partners: "Property",
                                sources: "Property"
                            }
                        ]
                    }
                }
            }
        },
        {
            $addFields: {
                dateData: {
                    $arrayToObject: {
                        $map: {
                            input: "$dateArray",
                            as: "dateArray",
                            in: {
                                k: "$$dateArray.date",
                                v: "$$dateArray.collections"
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                dateArray: 0
            }
        },
        {
            $group: {
                _id: "All",
                allData: {
                    $push: {
                        hotelName: "$_id",
                        dateData: "$dateData"
                    }
                }
            }
        },
        {
            $addFields: {
                data: {
                    $arrayToObject: {
                        $map: {
                            input: "$allData",
                            as: "hotelData",
                            in: {
                                k: "$$hotelData.hotelName",
                                v: "$$hotelData.dateData"
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                allData: 0
            }
        }
    ]

    let aggregation = [
        {
            $match: {
                isCancelled: false,
                hasNotShown: false,
                hotelId: {
                    $in: hotelIds,
                },
                isPaymentCollected: true,
                $expr: {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: "$collections",
                                    as: "collection",
                                    cond: {
                                        $and: [
                                            {
                                                $gte: ["$$collection.date", startTime.toDate()]
                                            },
                                            {
                                                $lte: ["$$collection.date", endTime.toDate()]
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        0
                    ]
                }
            },
        },
        {
            $project: {
                hotelId: 1,
                collections: 1,
                timezone: 1,
                checkIn: 1,
                checkOut: 1,
                bookingId: 1,
                name: 1,
                phoneNumber: 1,
                amount: 1,
                bookedRooms: 1,
                hasCheckedIn: 1,
                hasCheckedOut: 1,
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
            $addFields: {
                bookingStatus: {
                    $cond: [
                        "$hasCheckedOut",
                        "Checked Out",
                        {
                            $cond: [
                                "$hasCheckedIn",
                                "Checked In",
                                "Upcoming"
                            ]
                        }
                    ]
                }
            }
        },
        {
            $project: {
                hasCheckedIn: 0,
                hasCheckedOut: 0
            }
        },
        {
            $project: {
                bookedRooms: 0
            }
        },

        {
            $addFields: {
                collections: {
                    $map: {
                        input: "$collections",
                        as: "collection",
                        in: {
                            $cond: {
                                if: {
                                    $not: {
                                        $eq: [
                                            {
                                                $type: "$$collection.transaction"
                                            },
                                            "object"
                                        ]
                                    }
                                },
                                then: "$$collection",
                                else: {
                                    $cond: [
                                        {
                                            $eq: [
                                                "$$collection.transaction.paymentMode",
                                                "CARD"
                                            ]
                                        },
                                        {
                                            $setField: {
                                                field: "TidCARD",
                                                value: "$$collection.total",
                                                input: "$$collection"
                                            }
                                        },
                                        {
                                            $setField: {
                                                field: "TidUPI",
                                                value: "$$collection.total",
                                                input: "$$collection"
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        },

        {
            $unwind: {
                path: "$collections"
            }
        },
        {
            $addFields: {
                colDate: {
                    $dateToString: {
                        date: "$collections.date",
                        format: "%d-%m-%Y",
                        timezone: "$timezone"
                    }
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
            $group: {
                _id: {
                    hotelName: {
                        $toString: "$hotelId"
                    },
                    date: "$colDate"
                },
                bookings: {
                    $push: {
                        Cash: {
                            $sum: "$collections.cash"
                        },
                        Bank: {
                            $sum: "$collections.bank"
                        },
                        Ota: {
                            $sum: "$collections.ota"
                        },
                        TidCARD: {
                            $sum: "$collections.TidCARD"
                        },
                        TidUPI:{
                            $sum: "$collections.TidUPI"
                        },
                        hotelId: {
                            $toString: "$hotelId",
                        },
                        bookingId: "$bookingId",
                        rooms: "$noOfRooms",
                        name: "$name",
                        phoneNumber: "$phoneNumber",
                        amount: "$amount",
                        status: "$bookingStatus",
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
                        },
                        partners: "Property",
                        sources: "Property"
                    }
                }
            }
        },
        {
            $group: {
                _id: "$_id.hotelName",
                dateArray: {
                    $push: {
                        date: "$_id.date",
                        collections: "$bookings"
                    }
                }
            }
        },
        {
            $addFields: {
                dateData: {
                    $arrayToObject: {
                        $map: {
                            input: "$dateArray",
                            as: "dateArray",
                            in: {
                                k: "$$dateArray.date",
                                v: "$$dateArray.collections"
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                dateArray: 0
            }
        },
        {
            $group: {
                _id: "All",
                allData: {
                    $push: {
                        hotelName: "$_id",
                        dateData: "$dateData"
                    }
                }
            }
        },
        {
            $addFields: {
                data: {
                    $arrayToObject: {
                        $map: {
                            input: "$allData",
                            as: "hotelData",
                            in: {
                                k: "$$hotelData.hotelName",
                                v: "$$hotelData.dateData"
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                allData: 0
            }
        }
    ]


    const [data, hotels] = await Promise.all([
        Bookings.aggregate(isTable ? tAggregation : aggregation),
        Hotel.find({ _id: { $in: hotelIds } }, { _id: 1, hotelName: 1 })
    ])

    let rData: {
        [key: string]: {
            [key: string]: ({ [key: string]: number }[]) | ICollectionAccountAnalyticsBooking[]
        }
    } = {}

    for (let i = 0; i < hotels.length; i++) {
        let allDateData: {
            [key: string]: ({ [key: string]: number }[]) | ICollectionAccountAnalyticsBooking[]
        } = {}
        for (let j = 0; j < allDays.length; j++) {
            let thatDateData: ({ [key: string]: number }[]) | ICollectionAccountAnalyticsBooking[] = []
            let thatData = undefined
            try {
                thatData = data[0].data[hotels[i]._id.toString()][allDays[j]]
            } catch (err) {
            }
            if (thatData) {
                thatDateData = thatData
            } else {
                thatDateData = []
            }
            allDateData[allDays[j]] = thatDateData
        }
        rData[isHotelId ? hotels[i]._id.toString() : hotels[i].hotelName] = allDateData
    }
    return rData
}


export default getBookingCollectionAnalytics