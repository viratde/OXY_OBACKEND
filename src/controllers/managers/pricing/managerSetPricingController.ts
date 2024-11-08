import { Request, Response } from "express"
import Hotel from "../../../models/hotels/hotelModel"
import moment from "moment-timezone"
import setNewPricing from "../../../utils/pricing/setNewPricing"
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest"
import IPriceRequest, { IPriceSetter } from "../../../utils/pricing/PriceRequest"

const managerSetPricingController = async (req: Request, res: Response) => {

    try {

        // const decodedData = (req as ManagerAuthRequest).decodedData;

        const { hotelId } = req.body

        let prices: IPriceRequest[] = req.body.prices

        const hotel = await Hotel.findOne({ _id: hotelId })

        if (!hotel) {
            return res.status(400).json({ status: false, message: "Please enter correct hotelId" })
        }

        // if (
        //     !decodedData.permissions.find((perm) => {
        //         return (
        //             perm.hotel.toString() == hotel._id.toString() &&
        //             perm.canUpdatePricing
        //         );
        //     })
        // ) {
        //     return res
        //         .status(400)
        //         .json({ status: false, message: "You do not have access." });
        // }

        if (!Array.isArray(prices)) {
            return res.status(400).json({ status: false, message: "Please enter correct prices." })
        }


        for (let i = 0; i < prices.length; i++) {
            if (!Object.keys(hotel.roomTypes).includes(prices[i].roomType)) {
                return res.status(400).json({ status: false, message: "Please choose correct room type." })
            }

            let eStartTime = moment.tz(`${prices[i].startTime}-${hotel.checkIn}`, "DD-MM-YYYY-HH-mm", hotel.timezone)
            let eEndTime = moment.tz(`${prices[i].endTime}-${hotel.checkOut}`, "DD-MM-YYYY-HH-mm", hotel.timezone)

            if (!eStartTime.isValid()) {
                return res.status(400).json({ status: false, message: "Please choose correct start date." })
            }

            if (!eEndTime.isValid() || eEndTime.unix() <= eStartTime.unix()) {
                return res.status(400).json({ status: false, message: "Please choose correct end date." })
            }

            if (isNaN(prices[i].pax1Price) || isNaN(prices[i].pax2Price) || isNaN(prices[i].pax3Price) || prices[i].pax1Price < hotel.minPrice || prices[i].pax3Price > hotel.maxPrice) {
                return res.status(400).json({ status: false, message: "Please enter correct prices." })
            }
            let isCreated = await setNewPricing(
                hotel,
                eStartTime,
                eEndTime,
                prices[i].pax1Price,
                prices[i].pax2Price,
                prices[i].pax3Price,
                prices[i].roomType,
                hotel.minPrice
            )
            if (!isCreated) {
                return res.status(400).json({ status: false, message: "Please try after some time." })
            }
        }
        return res.status(200).json({ status: true, message: "Price Updated Successfully." })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: "Please try after some time." })
    }

}



export default managerSetPricingController