import { Moment } from "moment"
import Hotel from "../../models/hotels/hotelModel"
import Constant from "../../Constant/Constant"



const getHotels = async (
    count: number,
    page: number,
    checkInDate: Moment,
    checkOutDate: Moment,
    guests: Array<number>,
    location: { lat: number, lng: number },
) => {


    const allDays = Array(Math.ceil((checkOutDate.unix() - checkInDate.unix()) / (24 * 60 * 60))).fill(0).map((value, index) => {
        return checkInDate.clone().add(index, "day").format("DD-MM-YYYY")
    })

    const hotels = await Hotel.aggregate(
        [
            {
                $match: {
                    isHotelListed: true
                }
            },

            {
                $project: {
                    hotelName: 1,
                    latitude: 1,
                    longitude: 1,
                    timezone: 1,
                    _id: 1,
                    minPrice: 1,
                    maxPrice: 1,
                    hotelAddress: 1,
                    noOfReviews: 1,
                    rating: 1,
                    imageData:1
                }
            },

            {
                $addFields: {
                    lat1: { $degreesToRadians: location.lat },
                    lat2: { $degreesToRadians: "$latitude" },
                    lng1: { $degreesToRadians: location.lng },
                    lng2: { $degreesToRadians: "$longitude" },
                }
            },
            {
                $addFields: {
                    dLat1: { $subtract: ["$lat1", "$lat2"] },
                    dLng1: { $subtract: ["$lng1", "$lng2"] },
                }
            },

            {

                $addFields: {
                    a: {
                        $add: [
                            {
                                $pow: [
                                    {
                                        $sin: { $divide: ["$dLat1", 2] }
                                    },
                                    2
                                ]
                            },
                            {
                                $multiply: [
                                    {
                                        $pow: [
                                            {
                                                $sin: { $divide: ["$dLng1", 2] }
                                            },
                                            2
                                        ]
                                    },
                                    {
                                        $cos: "$lat1"
                                    },
                                    {
                                        $cos: "$lat2"
                                    },
                                ]
                            }
                        ]
                    }
                }

            },


            {
                $addFields: {
                    distance: {
                        $multiply: [
                            2,
                            {
                                $atan: {
                                    $divide: [
                                        {
                                            $sqrt: "$a"
                                        },
                                        {
                                            $sqrt: {
                                                $subtract: [
                                                    1,
                                                    "$a"
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]

                    }
                }
            },

            {
                $sort: {
                    distance: 1
                }
            },
            {
                $skip: (page - 1) * count
            },
            {
                $limit: count
            },
            {
                $addFields: {
                    from: location
                }
            },
            {
                $lookup: {
                    from: "prices",
                    let: {
                        hotelId: { $toString: "$_id" },
                        checkInDate: checkInDate.toDate(),
                        checkOutDate: checkOutDate.toDate(),
                        timezone: "$timezone"
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
                    image: {
                        $arrayElemAt: [
                            {
                                $getField: {
                                    input: {
                                        $arrayElemAt: [{ $objectToArray: "$imageData" }, 0]
                                    },
                                    field: "v"
                                }
                            },
                            0
                        ]
                    },
                    name: "$hotelName",
                    address: "$hotelAddress",
                    shortAddress: "$hotelAddress",
                    noOfReviews: "$noOfReviews",
                    rating: { $round: ["$rating", 2] },
                    id: { $toString: "$_id" },
                    _id:0,
                    distance: {
                        $multiply: ["$distance", Constant.EARTH_RADIUS]
                    },
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

    return hotels

}

export default getHotels