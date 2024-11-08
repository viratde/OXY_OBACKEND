import moment from "moment-timezone";
import { Types } from "mongoose";
import Bookings from "../../models/bookings/bookingModel";
import Hotel from "../../models/hotels/hotelModel";
import Partner from "../../models/expenses/partnerModel";
import { GstPercentage, PartnerGstPercentage } from "../../enums/BookingSource";
import {IRevenueAccountAnalyticsBooking} from "./accountAnalyticsBookingFormat";

const getAccountSalesAnalyticsController = async (
    startDay: string,
    days: number,
    isTable: boolean,
    hotelIds: Array<Types.ObjectId>
) => {


    let startDate = moment.tz(`${startDay} 00:00:00`, "DD-MM-YYYY HH:mm:ss", "UTC");

    let startTime = moment.tz(`${startDay} 00:00:00`, "DD-MM-YYYY HH:mm:ss", "Asia/Kolkata").subtract(12, "hour")
    let endTime = moment.tz(`${startDay} 00:00:00`, "DD-MM-YYYY HH:mm:ss", "Asia/Kolkata").add(days, "day").add(12, "hour")

    let allDays = [startDate.format("DD-MM-YYYY")];

    for (let i = 1; i < days; i++) {
        allDays.push(startDate.clone().add(i, "day").format("DD-MM-YYYY"));
    }

    const fHotelIds = await Partner.aggregate([{ $match: { partnerId: { $in: hotelIds } } }, { $graphLookup: { from: "partners", startWith: "$partnerId", connectFromField: "id", connectToField: "partnerId", as: "partners", depthField: "depth" } }, { $addFields: { partners: { $map: { input: "$partners", as: "pt", in: { partnerId: "$$pt.partnerId", id: { $cond: { if: { $eq: ["$$pt.depth", 0] }, then: "$$pt.id", else: "$$pt.id" } }, } } } } }, { $facet: { HOTELS: [{ $project: { id: "$partnerId" } }], PARTNERS: [{ $unwind: "$partners" }, { $project: { id: "$partners.id" } }] } }, { $addFields: { all: { $concatArrays: ["$$ROOT.HOTELS", "$$ROOT.PARTNERS"] } } }, { $project: { HOTELS: 0, PARTNERS: 0 } }, { $unwind: "$all" }, { $replaceRoot: { newRoot: "$all" } },])

    let aggregation = [
        {
            $match: {
                isCancelled: false,
                hasNotShown: false,
                hotelId: {
                    $in: [...fHotelIds.map(a => a.id), ...hotelIds]
                },
                $or: [
                    {
                        $expr: {
                            $and: [
                                { $gte: ["$createdAt", startTime.toDate()] },
                                { $lt: ["$createdAt", endTime.toDate()] },
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
                                                    { $gte: ["$$extraCharge.date", startTime.toDate()] },
                                                    { $lt: ["$$extraCharge.date", endTime.toDate()] },
                                                    { $gt: ["$$extraCharge.revenueAmount", 0] }
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
            }
        },
        {
            $project: {
                hotelId: 1,
                extraCharges: 1,
                bookingAmount: 1,
                timezone: 1,
                referenceId: 1,
                convenienceAmount: 1,
                createdAt: 1,
                name: 1,
                phoneNumber: 1,
                amount: 1,
                bookingId: 1,
                checkIn: 1,
                checkOut: 1,
                bookedRooms: 1,
                hasCheckedIn: 1,
                hasCheckedOut: 1
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
                sales: {
                    $concatArrays: [
                        {
                            $map: {
                                input: "$extraCharges",
                                as: "extra",
                                in: {
                                    date: {
                                        $dateToString: {
                                            date: "$$extra.date",
                                            format: "%d-%m-%Y",
                                            timezone: "$timezone"
                                        }
                                    },
                                    amount: "$$extra.revenueAmount",
                                    XBR: 0,
                                    OBR: 0,
                                    CFEE: 0,
                                    XECR: {
                                        $cond: [
                                            { $ifNull: ["$referenceId", false] },
                                            0,
                                            "$$extra.revenueAmount"
                                        ]
                                    },
                                    OECR: {
                                        $cond: [
                                            { $ifNull: ["$referenceId", false] },
                                            "$$extra.revenueAmount",
                                            0
                                        ]
                                    }
                                }
                            }
                        },
                        [
                            {
                                date: {
                                    $dateToString: {
                                        date: "$createdAt",
                                        format: "%d-%m-%Y",
                                        timezone: "$timezone"
                                    }
                                },
                                amount: "$bookingAmount",
                                XBR: {
                                    $cond: [
                                        { $ifNull: ["$referenceId", false] },
                                        0,
                                        "$bookingAmount"
                                    ]
                                },
                                OBR: {
                                    $cond: [
                                        { $ifNull: ["$referenceId", false] },
                                        "$bookingAmount",
                                        0
                                    ]
                                },
                                XECR: 0,
                                OECR: 0,
                                CFEE: 0
                            },
                            {
                                date: {
                                    $dateToString: {
                                        date: "$createdAt",
                                        format: "%d-%m-%Y",
                                        timezone: "$timezone"
                                    }
                                },
                                amount: "$convenienceAmount",
                                XBR: 0,
                                OBR: 0,
                                XECR: 0,
                                OECR: 0,
                                CFEE: "$convenienceAmount"
                            }
                        ]
                    ]
                }
            }
        },

        {
            $project: {
                extraCharges: 0,
                bookingAmount: 0,
                referenceId: 0,
                convenienceAmount: 0,
                createdAt: 0,
                timezone: 0
            }
        },
        {
            $addFields: {
                sales: {
                    $filter: {
                        input: "$sales",
                        as: "sale",
                        cond: {
                            $gt: ["$$sale.amount", 0]
                        }
                    }
                }
            }
        },
        {
            $unwind: {
                path: "$sales"
            }
        },


        {
            $addFields: {
                "XBR": {
                    $round: [{ $divide: ["$sales.XBR", GstPercentage] }, 2]
                },
                "XECR": {
                    $round: [{ $divide: ["$sales.XECR", GstPercentage] }, 2]
                },
                "OBR": {
                    $round: [{ $divide: ["$sales.OBR", GstPercentage] }, 2]
                },
                "OECR": {
                    $round: [{ $divide: ["$sales.OECR", GstPercentage] }, 2]
                },
                "CFEE": "$sales.CFEE",
                date: "$sales.date",
            },
        },
        {
            $addFields: {
                "GST": {
                    $round: [
                        {
                            $sum: [
                                "$sales.XBR",
                                "$sales.XECR",
                                "$sales.OBR",
                                "$sales.OECR",
                                {
                                    $subtract: [0, "$XBR"]
                                },
                                {
                                    $subtract: [0, "$XECR"]
                                },
                                {
                                    $subtract: [0, "$OBR"]
                                },
                                {
                                    $subtract: [0, "$OECR"]
                                }
                            ]
                        },
                        2
                    ]
                }
            }
        },
        {
            $project: {
                sales: 0
            }
        },





        {
            $graphLookup: {
                from: "partners",
                startWith: "$hotelId",
                connectFromField: "partnerId",
                connectToField: "id",
                as: "partners",
                depthField: "depth"
            }
        },
        {
            $addFields: {
                partners: {
                    $map: {
                        input: "$partners",
                        as: "pt",
                        in: {
                            partnerId: "$$pt.id",
                            XBR: "$$pt.XBR",
                            OBR: "$$pt.OBR",
                            OECR: "$$pt.OECR",
                            XECR: "$$pt.XECR",
                            CFEE: "$$pt.CFEE",
                            id: "$$pt.partnerId",
                            GST:"$$pt.GST"
                        }
                    }
                }
            }
        },

        {
            $lookup: {
                from: "hotels",
                localField: "hotelId",
                foreignField: "_id",
                as: "sources"
            }
        },
        {
            $unwind: "$sources"
        },
        {
            $addFields: {
                sources: "$sources.hotelName"
            }
        },



        {
            $facet: {
                HOTELS: [
                    {
                        $addFields: {
                            partners: "$sources",
                            sources: "$sources"
                        }
                    }
                ],
                PARTNERS: [
                    {
                        $unwind: "$partners"
                    },
                    {
                        $addFields: {
                            XBR: {
                                $multiply: [
                                    "$XBR",
                                    {
                                        $divide: [
                                            "$partners.XBR",
                                            100
                                        ]
                                    }
                                ]
                            },
                            XECR: {
                                $multiply: [
                                    "$XECR",
                                    {
                                        $divide: [
                                            "$partners.XECR",
                                            100
                                        ]
                                    }
                                ]
                            },
                            OBR: {
                                $multiply: [
                                    "$OBR",
                                    {
                                        $divide: [
                                            "$partners.OBR",
                                            100
                                        ]
                                    }
                                ]
                            },
                            OECR: {
                                $multiply: [
                                    "$OECR",
                                    {
                                        $divide: [
                                            "$partners.OECR",
                                            100
                                        ]
                                    }
                                ]
                            },
                            CFEE: {
                                $multiply: [
                                    "$CFEE",
                                    {
                                        $divide: [
                                            "$partners.CFEE",
                                            100
                                        ]
                                    }
                                ]
                            },
                        },
                    },

                    {
                        $addFields: {
                            GST: {
                                $round: [
                                    {
                                        $multiply: [
                                            {
                                                $sum: [
                                                    "$XBR",
                                                    "$XECR",
                                                    "$OBR",
                                                    "$OECR",
                                                ]
                                            },
                                            {
                                                $divide:[
                                                    "$partners.GST",
                                                    100
                                                ]
                                            }
                                        ]
                                    },
                                    2
                                ]
                            }
                        }
                    },

                    {
                        $addFields: {
                            partners: "$partners.partnerId",
                            hotelId: "$partners.id",
                            sources: "$sources"
                        }
                    },
                    {
                        $lookup: {
                            from: "hotels",
                            localField: "partners",
                            foreignField: "_id",
                            as: "partners"
                        }
                    },
                    {
                        $unwind: "$partners"
                    },
                    {
                        $addFields: {
                            partners: "$partners.hotelName"
                        }
                    },
                ]
            }
        },


        {
            $addFields: {
                all: {
                    $concatArrays: [
                        "$$ROOT.HOTELS",
                        "$$ROOT.PARTNERS"
                    ]
                }
            }
        },
        {
            $project: {
                HOTELS: 0,
                PARTNERS: 0
            }
        },
        {
            $unwind: "$all"
        },
        {
            $replaceRoot: {
                newRoot: "$all"
            }
        },




        {
            $group: {
                _id: {
                    hotel: {
                        $toString: "$hotelId"
                    },
                    date: "$date",
                },
                bookings: {
                    $push: {
                        XBR: {
                            $sum: "$XBR",
                        },
                        OBR: {
                            $sum: "$OBR",
                        },
                        OECR: {
                            $sum: "$OECR",
                        },
                        XECR: {
                            $sum: "$XECR",
                        },
                        CFEE: {
                            $sum: "$CFEE",
                        },
                        GST: {
                            $sum: "$GST"
                        },
                        hotelId: {
                            $toString: "$hotelId",
                        },
                        bookingId: "$bookingId",
                        rooms: "$noOfRooms",
                        name: "$name",
                        phoneNumber: "$phoneNumber",
                        amount: "$amount",
                        status: {
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
                        },
                        partners: "$partners",
                        sources: "$sources"
                    }
                }
            }
        },
        {
            $group: {
                _id: "$_id.hotel",
                datesArray: {
                    $push: {
                        date: "$_id.date",
                        bookings: "$bookings",
                    },
                },
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
                hotelId: {
                    $in: [...fHotelIds.map(a => a.id), ...hotelIds]
                },
                $or: [
                    {
                        $expr: {
                            $and: [
                                { $gte: ["$createdAt", startTime.toDate()] },
                                { $lt: ["$createdAt", endTime.toDate()] },
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
                                                    { $gte: ["$$extraCharge.date", startTime.toDate()] },
                                                    { $lt: ["$$extraCharge.date", endTime.toDate()] },
                                                    { $gt: ["$$extraCharge.revenueAmount", 0] }
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
            }
        },
        {
            $project: {
                hotelId: 1,
                extraCharges: 1,
                bookingAmount: 1,
                timezone: 1,
                referenceId: 1,
                convenienceAmount: 1,
                createdAt: 1
            }
        },
        {
            $addFields: {
                sales: {
                    $concatArrays: [
                        {
                            $map: {
                                input: "$extraCharges",
                                as: "extra",
                                in: {
                                    date: {
                                        $dateToString: {
                                            date: "$$extra.date",
                                            format: "%d-%m-%Y",
                                            timezone: "$timezone"
                                        }
                                    },
                                    amount: "$$extra.revenueAmount",
                                    XBR: 0,
                                    OBR: 0,
                                    CFEE: 0,
                                    XECR: {
                                        $cond: [
                                            { $ifNull: ["$referenceId", false] },
                                            0,
                                            "$$extra.revenueAmount"
                                        ]
                                    },
                                    OECR: {
                                        $cond: [
                                            { $ifNull: ["$referenceId", false] },
                                            "$$extra.revenueAmount",
                                            0
                                        ]
                                    }
                                }
                            }
                        },
                        [
                            {
                                date: {
                                    $dateToString: {
                                        date: "$createdAt",
                                        format: "%d-%m-%Y",
                                        timezone: "$timezone"
                                    }
                                },
                                amount: "$bookingAmount",
                                XBR: {
                                    $cond: [
                                        { $ifNull: ["$referenceId", false] },
                                        0,
                                        "$bookingAmount"
                                    ]
                                },
                                OBR: {
                                    $cond: [
                                        { $ifNull: ["$referenceId", false] },
                                        "$bookingAmount",
                                        0
                                    ]
                                },
                                XECR: 0,
                                OECR: 0,
                                CFEE: 0
                            },
                            {
                                date: {
                                    $dateToString: {
                                        date: "$createdAt",
                                        format: "%d-%m-%Y",
                                        timezone: "$timezone"
                                    }
                                },
                                amount: "$convenienceAmount",
                                XBR: 0,
                                OBR: 0,
                                XECR: 0,
                                OECR: 0,
                                CFEE: "$convenienceAmount"
                            }
                        ]
                    ]
                }
            }
        },
        {
            $project: {
                extraCharges: 0,
                bookingAmount: 0,
                referenceId: 0,
                convenienceAmount: 0,
                createdAt: 0,
                timezone: 0
            }
        },
        {
            $addFields: {
                sales: {
                    $filter: {
                        input: "$sales",
                        as: "sale",
                        cond: {
                            $gt: ["$$sale.amount", 0]
                        }
                    }
                }
            }
        },
        {
            $unwind: {
                path: "$sales"
            }
        },



        {
            $addFields: {
                "XBR": {
                    $round: [{ $divide: ["$sales.XBR", GstPercentage] }, 2]
                },
                "XECR": {
                    $round: [{ $divide: ["$sales.XECR", GstPercentage] }, 2]
                },
                "OBR": {
                    $round: [{ $divide: ["$sales.OBR", GstPercentage] }, 2]
                },
                "OECR": {
                    $round: [{ $divide: ["$sales.OECR", GstPercentage] }, 2]
                },
                "CFEE": "$sales.CFEE",
                date: "$sales.date",
            },
        },
        {
            $addFields: {
                "GST": {
                    $round: [
                        {
                            $sum: [
                                "$sales.XBR",
                                "$sales.XECR",
                                "$sales.OBR",
                                "$sales.OECR",
                                {
                                    $subtract: [0, "$XBR"]
                                },
                                {
                                    $subtract: [0, "$XECR"]
                                },
                                {
                                    $subtract: [0, "$OBR"]
                                },
                                {
                                    $subtract: [0, "$OECR"]
                                }
                            ]
                        },
                        2
                    ]
                }
            }
        },
        {
            $project: {
                sales: 0
            }
        },





        {
            $graphLookup: {
                from: "partners",
                startWith: "$hotelId",
                connectFromField: "partnerId",
                connectToField: "id",
                as: "partners",
                depthField: "depth"
            }
        },
        {
            $addFields: {
                partners: {
                    $map: {
                        input: "$partners",
                        as: "pt",
                        in: {
                            partnerId: "$$pt.id",
                            XBR: "$$pt.XBR",
                            OBR: "$$pt.OBR",
                            OECR: "$$pt.OECR",
                            XECR: "$$pt.XECR",
                            CFEE: "$$pt.CFEE",
                            id: "$$pt.partnerId",
                            GST:"$$pt.GST"
                        }
                    }
                }
            }
        },

        {
            $lookup: {
                from: "hotels",
                localField: "hotelId",
                foreignField: "_id",
                as: "sources"
            }
        },
        {
            $unwind: "$sources"
        },
        {
            $addFields: {
                sources: "$sources.hotelName"
            }
        },


        {
            $facet: {
                HOTELS: [
                    {
                        $addFields: {
                            partners: "$sources",
                            sources: "$sources"
                        }
                    }
                ],
                PARTNERS: [
                    {
                        $unwind: "$partners"
                    },
                    {
                        $addFields: {
                            XBR: {
                                $multiply: [
                                    "$XBR",
                                    {
                                        $divide: [
                                            "$partners.XBR",
                                            100
                                        ]
                                    }
                                ]
                            },
                            XECR: {
                                $multiply: [
                                    "$XECR",
                                    {
                                        $divide: [
                                            "$partners.XECR",
                                            100
                                        ]
                                    }
                                ]
                            },
                            OBR: {
                                $multiply: [
                                    "$OBR",
                                    {
                                        $divide: [
                                            "$partners.OBR",
                                            100
                                        ]
                                    }
                                ]
                            },
                            OECR: {
                                $multiply: [
                                    "$OECR",
                                    {
                                        $divide: [
                                            "$partners.OECR",
                                            100
                                        ]
                                    }
                                ]
                            },
                            CFEE: {
                                $multiply: [
                                    "$CFEE",
                                    {
                                        $divide: [
                                            "$partners.CFEE",
                                            100
                                        ]
                                    }
                                ]
                            }
                        },
                    },

                    {
                        $addFields: {
                            GST: {
                                $round: [
                                    {
                                        $multiply: [
                                            {
                                                $sum: [
                                                    "$XBR",
                                                    "$XECR",
                                                    "$OBR",
                                                    "$OECR",
                                                ]
                                            },
                                            {
                                                $divide:[
                                                    "$partners.GST",
                                                    100
                                                ]
                                            }
                                        ]
                                    },
                                    2
                                ]
                            }
                        }
                    },


                    {
                        $addFields: {
                            partners: "$partners.partnerId",
                            hotelId: "$partners.id",
                            sources: "$sources"
                        }
                    },


                    {
                        $lookup: {
                            from: "hotels",
                            localField: "partners",
                            foreignField: "_id",
                            as: "partners"
                        }
                    },
                    {
                        $unwind: "$partners"
                    },
                    {
                        $addFields: {
                            partners: "$partners.hotelName"
                        }
                    },
                ]
            }
        },

        {
            $addFields: {
                all: {
                    $concatArrays: [
                        "$$ROOT.HOTELS",
                        "$$ROOT.PARTNERS"
                    ]
                }
            }
        },
        {
            $project: {
                HOTELS: 0,
                PARTNERS: 0
            }
        },
        {
            $unwind: "$all"
        },
        {
            $replaceRoot: {
                newRoot: "$all"
            }
        },


        {
            $group: {
                _id: {
                    hotel: {
                        $toString: "$hotelId"
                    },
                    date: "$date",
                    partners: "$partners",
                    sources: "$sources"
                },
                XBR: {
                    $sum: "$XBR",
                },
                OBR: {
                    $sum: "$OBR",
                },
                OECR: {
                    $sum: "$OECR",
                },
                XECR: {
                    $sum: "$XECR",
                },
                CFEE: {
                    $sum: "$CFEE",
                },
                GST: {
                    $sum: "$GST"
                }
            }
        },


        {
            $group: {
                _id: {
                    hotel: "$_id.hotel",
                    date: "$_id.date",
                    partners: "$_id.partners"
                },
                bookings: {
                    $push: {
                        XBR: "$XBR",
                        OBR: "$OBR",
                        XECR: "$XECR",
                        OECR: "$OECR",
                        CFEE: "$CFEE",
                        partners: "$_id.partners",
                        GST: "$GST",
                        sources: "$_id.sources"
                    }
                }
            }
        },
        {
            $group: {
                _id: {
                    hotel: "$_id.hotel",
                    date: "$_id.date",
                },
                bookings: {
                    $push: "$bookings"
                }
            }
        },
        {
            $unwind: "$bookings"
        },
        {
            $unwind: "$bookings"
        },




        {
            $group: {
                _id: {
                    hotel: "$_id.hotel",
                    date: "$_id.date",
                },
                bookings: {
                    $push: "$bookings"
                }
            }
        },
        {
            $group: {
                _id: "$_id.hotel",
                datesArray: {
                    $push: {
                        date: "$_id.date",
                        bookings: "$bookings"
                    },
                },
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


    const [data, hotels] = await Promise.all([
        Bookings.aggregate(isTable ? tAggregation : aggregation),
        Hotel.find({ _id: { $in: hotelIds } }, { _id: 1, hotelName: 1 })
    ])

    let rData: {
        [key: string]: {
            [key: string]: ({ [key: string]: any }[]) | IRevenueAccountAnalyticsBooking[]
        }
    } = {}

    for (let i = 0; i < hotels.length; i++) {
        let allDateData: {
            [key: string]: ({ [key: string]: any }[]) | IRevenueAccountAnalyticsBooking[]
        } = {}
        for (let j = 0; j < allDays.length; j++) {
            let thatDateData: ({ [key: string]: any }[]) | IRevenueAccountAnalyticsBooking[] = []
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
        rData[hotels[i].hotelName] = allDateData
    }
    return rData

}


export default getAccountSalesAnalyticsController