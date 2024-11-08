import moment from "moment-timezone";
import { Types } from "mongoose";
import Bookings from "../../models/bookings/bookingModel";
import Hotel from "../../models/hotels/hotelModel";
import { BookingSourcesShort } from "../../enums/BookingSource";

const getBookingSummaryAnalytics = async (
    startDay: string,
    days: number,
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
                bookingSource: 1,
                extraCharges: 1,
                referenceId: 1,
                convenienceAmount: 1,
                bookingAmount: 1
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
            $project: {
                canStayCheckIn: 0
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
                rExtraCharges: {
                    $filter: {
                        input: "$extraCharges",
                        as: "ecr",
                        cond: {
                            $eq: [
                                "$accountingDates",
                                {
                                    $dateToString: {
                                        date: "$$ecr.revenueDate",
                                        format: "%d-%m-%Y",
                                        timezone: "$timezone"
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
                extraCharges: 0,
            }
        },
        {
            $addFields: {
                BR: {
                    $round: [
                        {
                            $divide: [
                                "$bookingAmount",
                                "$noOfDays"
                            ]
                        },
                        2
                    ]
                },
                ECR: {
                    $sum: "$rExtraCharges.revenueAmount"
                }
            }
        },
        {
            $project: {
                bookingAmount: 0,
                rExtraCharges: 0
            }
        },
        {
            $addFields: {
                XBR: {
                    $cond: [
                        { $ifNull: ["$referenceId", false] },
                        0,
                        "$BR",
                    ],
                },
                XECR: {
                    $cond: [
                        { $ifNull: ["$referenceId", false] },
                        0,
                        "$ECR",
                    ],
                },
                OBR: {
                    $cond: [
                        { $ifNull: ["$referenceId", false] },
                        "$BR",
                        0,
                    ],
                },
                OECR: {
                    $cond: [
                        { $ifNull: ["$referenceId", false] },
                        "$ECR",
                        0,
                    ],
                },
                CFEE: {
                    $round: [
                        {
                            $cond: [
                                { $ifNull: ["$referenceId", false] },
                                {
                                    $divide: ["$convenienceAmount", "$noOfDays"],
                                },
                                0,
                            ]
                        },
                        2
                    ],
                },
            }
        },
        {
            $group: {
                _id: {
                    hotel: "$hotelId",
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
                rooms: {
                    $sum: "$noOfRooms"
                },
                XBR: {
                    $sum: "$XBR",
                },
                XECR: {
                    $sum: "$XECR"
                },
                OBR: {
                    $sum: "$OBR"
                },
                OECR: {
                    $sum: "$OECR"
                },
                CFEE: {
                    $sum: "$CFEE"
                }

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
                        rooms: "$rooms",
                        XBR: "$XBR",
                        OBR: "$OBR",
                        XECR: "$XECR",
                        OECR: "$OECR",
                        CFEE: "$CFEE"
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
                                v: {
                                    rooms: "$$booking.rooms",
                                    XBR: "$$booking.XBR",
                                    OBR: "$$booking.OBR",
                                    XECR: "$$booking.XECR",
                                    OECR: "$$booking.OECR",
                                    CFEE: "$$booking.CFEE"
                                }
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
                                k: {
                                    $toString: "$$hotelData.hotel"
                                },
                                v: "$$hotelData.dateData"
                            }
                        }
                    }
                },
            }
        }
    ]


    const [data, hotels] = await Promise.all([
        Bookings.aggregate(tAggregation),
        Hotel.find({ _id: { $in: hotelIds } }, { _id: 1, hotelName: 1, roomTypes: 1 })
    ])

    let rData: {
        [key: string]: {
            data: {
                [key: string]: {
                    [key: string]: ({ [key: string]: number })
                }
            },
            rooms: number
        }
    } = {}

    for (let i = 0; i < hotels.length; i++) {
        let allDateData: {
            [key: string]: {
                [key: string]: {
                    [key: string]: number
                }
            }
        } = {}
        for (let j = 0; j < allDays.length; j++) {
            let thatDateData: {
                [key: string]: {
                    [key: string]: number
                }
            } = {}
            for (let s = 0; s < BookingSourcesShort.length; s++) {
                let thatData = undefined
                try {
                    thatData = data[0].data[hotels[i]._id.toString()][allDays[j]][BookingSourcesShort[s]]
                } catch (err) {
                }
                if (thatData) {
                    thatDateData[BookingSourcesShort[s]] = thatData
                } else {
                    thatDateData[BookingSourcesShort[s]] = {
                        XBR: 0,
                        OBR: 0,
                        XECR: 0,
                        OECR: 0,
                        CFEE: 0,
                        rooms: 0
                    }
                }
            }
            allDateData[allDays[j]] = thatDateData
        }
        rData[hotels[i].hotelName] = {
            data: allDateData,
            rooms: Object.values(hotels[i].roomTypes).reduce((acc, cur) => {
                return acc + cur.availableRooms
            }, 0)
        }
    }
    return rData

}


export default getBookingSummaryAnalytics