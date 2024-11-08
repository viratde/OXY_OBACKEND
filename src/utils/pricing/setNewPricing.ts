import moment from "moment-timezone"
import Price from "../../models/price/priceModel"
import IHotel from "../../types/hotels/hotel"

const setNewPricing = async (
    hotel: IHotel,
    startDate: moment.Moment,
    endDate: moment.Moment,
    pax1Price: number,
    pax2Price: number,
    pax3Price: number,
    roomType: string,
    hotelMinPrice: number
): Promise<boolean> => {

    let prices = await Price.find({
        hotelId: hotel._id,
        roomType: roomType,
        $or: [
            {
                startTime: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            {
                endTime: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        ]
    })

    if (!prices) {
        if (
            pax1Price != hotelMinPrice || pax2Price != hotelMinPrice + 100 || pax3Price != hotelMinPrice + 300
        ) {
            await Price.create({ pax1Price, pax2Price, pax3Price, startTime: startDate, endTime: endDate, hotelId: hotel._id, roomType })
            return true
        }
    }

    for (let i = 0; i < prices.length; i++) {

        const sTime = moment(prices[i].startTime).unix()
        const eTime = moment(prices[i].endTime).unix()
        const startTime = startDate.clone().unix()
        const endTime = endDate.clone().unix()

        if (startTime <= sTime && endTime >= sTime && endTime < eTime) {
            prices[i].startTime = moment.tz(`${endDate.format("DD-MM-YYYY")} ${hotel.checkIn}`, "DD-MM-YYYY HH-mm", hotel.timezone).toDate()
            await prices[i].save()
        } else if (startTime <= sTime && endTime >= eTime) {
            await prices[i].deleteOne()
        } else if (startTime > sTime && endTime < eTime) {
            if (prices[i].pax1Price != hotelMinPrice || prices[i].pax2Price != hotelMinPrice + 100 || prices[i].pax3Price != hotelMinPrice + 300) {
                await Price.create({
                    pax1Price: prices[i].pax1Price,
                    pax2Price: prices[i].pax2Price,
                    pax3Price: prices[i].pax3Price,
                    startTime: moment.tz(`${endDate.format("DD-MM-YYYY")} ${hotel.checkIn}`, "DD-MM-YYYY HH-mm", hotel.timezone).toDate(),
                    endTime: prices[i].endTime,
                    hotelId: prices[i].hotelId,
                    roomType: prices[i].roomType
                })
            }
            prices[i].endTime = moment.tz(`${startDate.format("DD-MM-YYYY")} ${hotel.checkOut}`, "DD-MM-YYYY HH-mm", hotel.timezone).toDate()
            await prices[i].save()
        } else if (startTime > sTime && endTime >= eTime && startTime <= eTime) {
            prices[i].endTime = moment.tz(`${startDate.format("DD-MM-YYYY")} ${hotel.checkOut}`, "DD-MM-YYYY HH-mm", hotel.timezone).toDate()
            await prices[i].save()
        } else {
            console.log("unknown cond for pricing status")
        }

        if (prices[i].pax1Price != hotelMinPrice || prices[i].pax2Price != hotelMinPrice + 100 || prices[i].pax3Price != hotelMinPrice + 300) {
        } else {
            prices[i].deleteOne()
        }
    }
    if (
        pax1Price != hotelMinPrice || pax2Price != hotelMinPrice + 100 || pax3Price != hotelMinPrice + 300
    ) {
        await Price.create({ pax1Price, pax2Price, pax3Price, startTime: startDate.toDate(), endTime: endDate.toDate(), hotelId: hotel._id, roomType })
    }
    return true
}

export default setNewPricing