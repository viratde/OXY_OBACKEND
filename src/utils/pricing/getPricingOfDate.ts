import moment from "moment-timezone"
import Price from "../../models/price/priceModel"
import IHotel from "../../types/hotels/hotel"


const getPricingOfDate = async (
    hotels: IHotel[],
    date:moment.Moment
) => {
    let hotelIds = hotels.map(hot => hot._id)

    const prices = await Price.find({
        hotelId: {
            $in: hotelIds
        },
        endTime: {
            $gt: date.toDate()
        },
        startTime:{
            $lte:date.toDate()
        }
    })

    let data: { [key: string]: { [key: string]: { [key: string]: number } } } = {}
    for (let i = 0; i < hotels.length; i++) {

        let roomTypes = Object.keys(hotels[i].roomTypes)

        for (let r = 0; r < roomTypes.length; r++) {
            let price = prices.find((price) => {
                let c = date.toDate()
                return price.hotelId.toString() === hotels[i]._id.toString() && (c >= price.startTime && c < price.endTime) && (price.roomType === roomTypes[i])
            })

            let ddt = {
                ...((data[hotels[i]._id] ? data[hotels[i]._id] : {}) as { [key: string]: { [key: string]: number} }),
            }

            ddt[roomTypes[r]] = {
                pax1Price: price ? price.pax1Price : hotels[i].minPrice,
                pax2Price: price ? price.pax2Price : hotels[i].minPrice + 100,
                pax3Price: price ? price.pax3Price : hotels[i].minPrice + 300,
            }
            data[hotels[i]._id] = ddt
        }
    }

    return data
}
export default getPricingOfDate