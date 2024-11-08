import { Moment } from "moment";
import { Types } from "mongoose";
import Hotel from "../../models/hotels/hotelModel";


const getHotelPrice = async (
    guests: number[],
    checkInDate: Moment,
    checkOutDate: Moment,
    hotelId: Types.ObjectId,
    roomType: string
) => {

    const allDays = Array(Math.ceil((checkOutDate.unix() - checkInDate.unix()) / (24 * 60 * 60))).fill(0).map((value, index) => {
        return checkInDate.clone().add(index, "day").format("DD-MM-YYYY")
    })

    const hotels = await Hotel.aggregate(
        [
            {
                $match: {
                    isHotelListed: true,
                    _id: hotelId
                }
            },

            {
                $project: {
                    _id: 1,
                    minPrice: 1,
                    maxPrice: 1,
                    timezone:1
                }
            },

            {
                $lookup: {
                    from: "prices",
                    let: {
                        hotelId: { $toString: "$_id" },
                        checkInDate: checkInDate.toDate(),
                        checkOutDate: checkOutDate.toDate(),
                        timezone: "$timezone",
                        roomType: roomType
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [{ $toString: "$hotelId" }, "$$hotelId"]
                                        },
                                        {
                                            $gte: ["$startTime", "$$checkInDate"]
                                        },
                                        {
                                            $lte: ["$startTime", "$$checkOutDate"]
                                        },
                                        {
                                            $eq: ["$roomType", roomType]
                                        }
                                    ]
                                },
                            },
                        },
                        {
                            $sort: {
                                pax1Price: 1
                            }
                        },
                        {
                            $addFields: {
                                eDates: {
                                    $ceil: {
                                        $divide: [
                                            {
                                                $subtract: [
                                                    {
                                                        $toLong: "$endTime",
                                                    },
                                                    {
                                                        $toLong: "$startTime",
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
                                eDates: {
                                    $map: {
                                        input: {
                                            $cond: {
                                                if: { $eq: ["$eDates", 1] },
                                                then: [0],
                                                else: {
                                                    $range: [0, "$eDates", 1],
                                                },
                                            },
                                        },
                                        as: "day",
                                        in: {
                                            $dateToString: {
                                                date: {
                                                    $dateAdd: {
                                                        startDate: "$startTime",
                                                        unit: "day",
                                                        amount: "$$day"
                                                    }
                                                },
                                                format: "%d-%m-%Y",
                                                timezone: "$$timezone"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                pax1Price: "$pax1Price",
                                pax2Price: "$pax2Price",
                                pax3Price: "$pax3Price",
                                _id: 0,
                                roomType: "$roomType",
                                dates: "$eDates"
                            }
                        }
                    ],
                    as: "prices"
                }
            },
            {
                $addFields: {
                    prices: {
                        $map: {
                            input: allDays,
                            as: "dt",
                            in: {
                                $let: {
                                    vars: {
                                        thatDateprices: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$prices",
                                                        as: "pr",
                                                        cond: {
                                                            $in: ["$$dt", "$$pr.dates"]
                                                        },
                                                        limit: 1
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    },
                                    in: {
                                        $cond: {
                                            if: {
                                                $toBool: "$$thatDateprices"
                                            },
                                            then: {
                                                $reduce: {
                                                    input: guests,
                                                    initialValue: 0,
                                                    in: {
                                                        $add: [
                                                            "$$value",
                                                            {
                                                                $switch: {
                                                                    branches: [
                                                                        { case: { $eq: ["$$this", 1] }, then: "$$thatDateprices.pax1Price" },
                                                                        { case: { $eq: ["$$this", 2] }, then: "$$thatDateprices.pax2Price" },
                                                                        { case: { $eq: ["$$this", 3] }, then: "$$thatDateprices.pax3Price" }
                                                                    ]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            else: {
                                                $reduce: {
                                                    input: guests,
                                                    initialValue: 0,
                                                    in: {
                                                        $add: [
                                                            "$$value",
                                                            {
                                                                $switch: {
                                                                    branches: [
                                                                        { case: { $eq: ["$$this", 1] }, then: "$minPrice" },
                                                                        { case: { $eq: ["$$this", 2] }, then: { $add: ["$minPrice", 100] } },
                                                                        { case: { $eq: ["$$this", 3] }, then: { $add: ["$minPrice", 300] } }
                                                                    ]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },

            {
                $addFields: {
                    prices: {
                        $reduce: {
                            input: "$prices",
                            initialValue: 0,
                            in: { $add: ["$$this", "$$value"] }
                        }
                    }
                }
            },

            {
                $project: {
                    _id: 0,
                    pp:"$pp",
                    amount: "$prices",
                    maxAmount: {
                        $multiply: [
                            guests.length,
                            allDays.length,
                            "$maxPrice"
                        ]
                    },
                    avgAmount: {
                        $ceil: {
                            $divide: [
                                {
                                    $divide: [
                                        "$prices",
                                        allDays.length
                                    ]
                                },
                                guests.length
                            ]
                        }
                    },
                    avgMaxAmount: {
                        $ceil: {
                            $divide: [
                                {
                                    $divide: [
                                        {
                                            $multiply: [
                                                guests.length,
                                                allDays.length,
                                                "$maxPrice"
                                            ]
                                        },
                                        allDays.length
                                    ]
                                },
                                guests.length
                            ]
                        }
                    }
                }
            }
        ]
    )

    if (hotels.length != 1) {
        throw new Error("Hotel Not Found")
    }

    return hotels[0]

}

export default getHotelPrice