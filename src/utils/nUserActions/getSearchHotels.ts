import Constant from "../../Constant/Constant"
import Hotel from "../../models/hotels/hotelModel"


const getSearchHotels = async (
    text: string,
    location?: { lat: number, lng: number }
) => {


    const hotels = await Hotel.aggregate(
        location ? (
            [
                {
                    $match: {
                        isHotelListed: true,
                        $text: {
                            $search: text
                        }
                    }
                },
                {
                    $project: {
                        hotelName: 1,
                        hotelAddress: 1,
                        latitude: 1,
                        longitude: 1
                    }
                },
                { $sort: { score: { $meta: "textScore" } } },



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
                                },
                                Constant.EARTH_RADIUS
                            ]

                        }
                    }
                },

                {
                    $sort: {
                        distance: 1
                    }
                },

                { $limit: 5 }
            ]
        ) : (
            [
                {
                    $match: {
                        isHotelListed: true,
                        $text: {
                            $search: text
                        }
                    }
                },
                {
                    $project: {
                        hotelName: 1,
                        hotelAddress: 1,
                    }
                },
                { $sort: { score: { $meta: "textScore" } } },
                { $limit: 5 }
            ]
        )
    )


    return hotels.map(hot => {
        return {
            hotelName: hot.hotelName,
            hotelAddress: hot.hotelAddress,
            shortAddress: hot.hotelAddress,
            id: hot._id,
            distance:hot.distance
        }
    })
}

export default getSearchHotels