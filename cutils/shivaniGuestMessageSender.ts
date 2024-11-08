import Bookings from "../src/models/bookings/bookingModel"
import Hotel from "../src/models/hotels/hotelModel"


const shivaniGuestMessageSender = async () => {

    const hotel = await Hotel.findOne({ hotelName: "OXY SHIVANI" })
    if (!hotel) {
        return
    }
    const bookings = await Bookings.aggregate(
        [
            {
                $match: hotel._id
            },

            {
                $group:{
                    _id:"$userId"
                }
            }
        ]
    )

    console.log(bookings.length)

}

export default shivaniGuestMessageSender