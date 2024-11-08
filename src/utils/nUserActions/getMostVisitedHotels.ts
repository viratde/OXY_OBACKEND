import Hotel from "../../models/hotels/hotelModel"



const getMostVisitedHotels = async () => {

    const hotels = await Hotel.aggregate([
        {
            $match: {
                isHotelListed: true
            }
        },

        {
            $sort: {
                noOfReviews: -1
            }
        },

        {
            $limit: 3
        },

        {
            $project: {
                id: { $toString: "$_id" },
                _id: 0,
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
            }
        }
    ])


    return hotels

}

export default getMostVisitedHotels