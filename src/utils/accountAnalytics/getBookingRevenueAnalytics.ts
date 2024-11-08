import moment from "moment-timezone";
import { Types } from "mongoose";
import Bookings from "../../models/bookings/bookingModel";
import Hotel from "../../models/hotels/hotelModel";
import Partner from "../../models/expenses/partnerModel";
import { GstPercentage, PartnerGstPercentage, RevenueAnalyticsShort } from "../../enums/BookingSource";
import { IRevenueAccountAnalyticsBooking } from "./accountAnalyticsBookingFormat";

const getBookingRevenueAnalytics = async (
    startDay: string,
    days: number,
    isTable: boolean,
    hotelIds: Array<Types.ObjectId>,
    isHotelId: boolean = false
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

    const fHotelIds = await Partner.aggregate([
        {
            $match: {
                partnerId: {
                    $in: hotelIds
                }
            }
        },
        {
            $graphLookup: {
                from: "partners",
                startWith: "$partnerId",
                connectFromField: "id",
                connectToField: "partnerId",
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
                            partnerId: "$$pt.partnerId",
                            id: {
                                $cond: {
                                    if: {
                                        $eq: ["$$pt.depth", 0]
                                    },
                                    then: "$$pt.id",
                                    else: "$$pt.id"
                                }
                            },
                        }
                    }
                }
            }
        },
        {
            $facet: {
                HOTELS: [
                    {
                        $project: {
                            id: "$partnerId"
                        }
                    }
                ],
                PARTNERS: [
                    {
                        $unwind: "$partners"
                    },
                    {
                        $project: {
                            id: "$partners.id"
                        }
                    }
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

    ])


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
                    $in: [...fHotelIds.map(a => a.id), ...hotelIds]
                }
            }
        },
        {
            $project: {
                hotelId: 1,
                checkIn: 1,
                checkOut: 1,
                extraCharges: 1,
                bookingAmount: 1,
                bookedRooms: 1,
                canStayCheckIn: 1,
                timezone: 1,
                referenceId: 1,
                convenienceAmount: 1,
                name: 1,
                amount: 1,
                phoneNumber: 1,
                bookingId: 1,
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
                extraCharges: 0
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
                        {
                            $and: [
                                {
                                    $ifNull: ["$referenceId", false]
                                },
                                {
                                    $gt: [
                                        {
                                            $strLenCP: "$referenceId"
                                        },
                                        0
                                    ]
                                }
                            ]
                        },
                        0,
                        "$BR",
                    ],
                },
                XECR: {
                    $cond: [
                        {
                            $and: [
                                {
                                    $ifNull: ["$referenceId", false]
                                },
                                {
                                    $gt: [
                                        {
                                            $strLenCP: "$referenceId"
                                        },
                                        0
                                    ]
                                }
                            ]
                        },
                        0,
                        "$ECR",
                    ],
                },
                OBR: {
                    $cond: [
                        {
                            $and: [
                                {
                                    $ifNull: ["$referenceId", false]
                                },
                                {
                                    $gt: [
                                        {
                                            $strLenCP: "$referenceId"
                                        },
                                        0
                                    ]
                                }
                            ]
                        },
                        "$BR",
                        0,
                    ],
                },
                OECR: {
                    $cond: [
                        {
                            $and: [
                                {
                                    $ifNull: ["$referenceId", false]
                                },
                                {
                                    $gt: [
                                        {
                                            $strLenCP: "$referenceId"
                                        },
                                        0
                                    ]
                                }
                            ]
                        },
                        "$ECR",
                        0,
                    ],
                },
                CFEE: {
                    $round: [
                        {
                            $cond: [
                                {
                                    $and: [
                                        {
                                            $ifNull: ["$referenceId", false]
                                        },
                                        {
                                            $gt: [
                                                {
                                                    $strLenCP: "$referenceId"
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                },
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
            $addFields: {
                XBR: {
                    $round: [{ $divide: ["$XBR", GstPercentage] }, 2]
                },
                XECR: {
                    $round: [{ $divide: ["$XECR", GstPercentage] }, 2]
                },
                OBR: {
                    $round: [{ $divide: ["$OBR", GstPercentage] }, 2]
                },
                OECR: {
                    $round: [{ $divide: ["$OECR", GstPercentage] }, 2]
                },
            },
        },
        {
            $addFields: {
                GST: {
                    $round: [
                        {
                            $sum: [
                                "$BR",
                                "$ECR",
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
                referenceId: 0,
                convenienceAmount: 0,
                noOfDays: 0,
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
                            GST: "$$pt.GST"
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
                            GST: 0
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
                                                $divide: [
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
                    date: "$accountingDates",
                },
                bookings: {
                    $push: {
                        hotelId: {
                            $toString: "$hotelId",
                        },
                        bookingId: "$bookingId",
                        rooms: "$noOfRooms",
                        name: "$name",
                        phoneNumber: "$phoneNumber",
                        amount: "$amount",
                        XBR: "$XBR",
                        XECR: "$XECR",
                        OBR: "$OBR",
                        OECR: "$OECR",
                        CFEE: "$CFEE",
                        GST: "$GST",
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
                    $in: [...fHotelIds.map(a => a.id), ...hotelIds]
                }
            }
        },
        {
            $project: {
                hotelId: 1,
                checkIn: 1,
                checkOut: 1,
                extraCharges: 1,
                bookingAmount: 1,
                canStayCheckIn: 1,
                timezone: 1,
                referenceId: 1,
                convenienceAmount: 1,
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
                extraCharges: 0
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
                        {
                            $and: [
                                {
                                    $ifNull: ["$referenceId", false]
                                },
                                {
                                    $gt: [
                                        {
                                            $strLenCP: "$referenceId"
                                        },
                                        0
                                    ]
                                }
                            ]
                        },
                        0,
                        "$BR",
                    ],
                },
                XECR: {
                    $cond: [
                        {
                            $and: [
                                {
                                    $ifNull: ["$referenceId", false]
                                },
                                {
                                    $gt: [
                                        {
                                            $strLenCP: "$referenceId"
                                        },
                                        0
                                    ]
                                }
                            ]
                        },
                        0,
                        "$ECR"
                    ],
                },
                OBR: {
                    $cond: [
                        {
                            $and: [
                                {
                                    $ifNull: ["$referenceId", false]
                                },
                                {
                                    $gt: [
                                        {
                                            $strLenCP: "$referenceId"
                                        },
                                        0
                                    ]
                                }
                            ]
                        },
                        "$BR",
                        0
                    ],
                },
                OECR: {
                    $cond: [
                        {
                            $and: [
                                {
                                    $ifNull: ["$referenceId", false]
                                },
                                {
                                    $gt: [
                                        {
                                            $strLenCP: "$referenceId"
                                        },
                                        0
                                    ]
                                }
                            ]
                        },
                        "$ECR",
                        0,
                    ],
                },
                CFEE: {
                    $round: [
                        {
                            $cond: [
                                {
                                    $and: [
                                        {
                                            $ifNull: ["$referenceId", false]
                                        },
                                        {
                                            $gt: [
                                                {
                                                    $strLenCP: "$referenceId"
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                },
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
            $addFields: {
                XBR: {
                    $round: [{ $divide: ["$XBR", GstPercentage] }, 2]
                },
                XECR: {
                    $round: [{ $divide: ["$XECR", GstPercentage] }, 2]
                },
                OBR: {
                    $round: [{ $divide: ["$OBR", GstPercentage] }, 2]
                },
                OECR: {
                    $round: [{ $divide: ["$OECR", GstPercentage] }, 2]
                },
            },
        },
        {
            $addFields: {
                GST: {
                    $round: [
                        {
                            $sum: [
                                "$BR",
                                "$ECR",
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
                hotelId: 1,
                XBR: 1,
                OBR: 1,
                OECR: 1,
                XECR: 1,
                CFEE: 1,
                GST: 1,
                accountingDates: 1
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


        //implement staging 

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
                            GST: "$$pt.GST"
                        }
                    }
                }
            }
        },

        {
            $facet: {
                HOTELS: [
                    {
                        $addFields: {
                            partners: "$sources",
                            sources: "$sources"
                        },
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
                                                $divide: [
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
                    date: "$accountingDates",
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
        rData[isHotelId ? hotels[i]._id.toString() : hotels[i].hotelName] = allDateData
    }

    return rData

}



export default getBookingRevenueAnalytics