import moment from "moment-timezone"
import Price from "../../models/price/priceModel"
import IHotel from "../../types/hotels/hotel"


const getPricing = async (
    hotels: IHotel[]
) => {
    let curDate = moment.tz(`${moment.tz(new Date(),"Asia/Kolkata").format("DD-MM-YYYY")}-12-00-00`, "DD-MM-YYYY-HH-mm-ss", "Asia/Kolkata")
    let hotelIds = hotels.map(hot => hot._id)

    const prices = await Price.find({
        hotelId: {
            $in: hotelIds
        },
        endTime: {
            $gte: curDate
        }
    })



    let data: { [key: string]:  { [key: string]: { [key: string]: { [key: string]: number } } } } = {}
    for (let i = 0; i < hotels.length; i++) {

        let roomTypes = Object.keys(hotels[i].roomTypes)

        for (let r = 0; r < roomTypes.length; r++) {

            for (let j = 0; j < 30; j++) {

                let cDate = curDate.clone().add(j, "day")
                let price = prices.find((price) => {
                    let c = cDate.toDate()
                    return price.hotelId.toString() === hotels[i]._id.toString() && (c >= price.startTime && c < price.endTime) && (price.roomType === roomTypes[r])
                })


                let ddt = {
                    ...((data[hotels[i]._id] ? data[hotels[i]._id] : {}) as { [key: string]: { [key: string]: { [key: string]: number } } }),
                }

                let dddt = {
                    ...(ddt[roomTypes[r]])
                }

                dddt[cDate.format("DD-MM-YYYY")] = {
                    pax1Price: price ? price.pax1Price : hotels[i].minPrice,
                    pax2Price: price ? price.pax2Price : hotels[i].minPrice + 100,
                    pax3Price: price ? price.pax3Price : hotels[i].minPrice + 300,
                }

                ddt[roomTypes[r]] = dddt
                data[hotels[i]._id] = ddt

            }

        }


    }

    return data
}
export default getPricing