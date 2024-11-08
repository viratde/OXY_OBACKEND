import { Request, Response } from "express";
import Constant from "../../Constant/Constant";
import moment from "moment-timezone";
import getHotelDetails from "../../utils/nUserActions/getHotelDetails";
import { isValidObjectId, Types } from "mongoose";


const getHotelDetailsController = async (
    req: Request,
    res: Response
) => {

    try {

        const { guests, checkIn, checkOut } = req.query

        const timeline = Constant.DEAFULT_TIMELINE
        const checkInTime = Constant.CHECK_IN_TIME
        const checkOutTime = Constant.CHECK_OUT_TIME

        const minCheckInDate = moment(new Date()).tz(timeline).hours(12).minutes(0).seconds(0).milliseconds(0)
        const minCheckOutDate = minCheckInDate.clone().add(23, 'hour')

        const aGuest = guests && typeof guests == "string" && guests.split(",").every(g => !isNaN(Number(g)) && Number(g) > 0) ? guests.split(",").map(g => Number(g)) : Constant.DEFAULT_SEARCH_GUESTS_AND_ROOM
        const checkInDate = checkIn ? (moment.tz(`${checkIn}-${checkInTime}`, "DD-MM-YYYY-HH-mm-ss", timeline)).milliseconds(0) : undefined
        const checkOutDate = checkOut ? (moment.tz(`${checkOut}-${checkOutTime}`, "DD-MM-YYYY-HH-mm-ss", timeline)).milliseconds(0) : undefined
        const hotelId = req.params.hotelId

        if (!isValidObjectId(hotelId)) {
            return res.status(404).json({
                status: false,
                message: "Please choose correct hotel."
            })
        }

        if (checkOutDate && checkInDate && checkOutDate.unix() < checkInDate.unix() && checkOutDate.unix() < minCheckOutDate.unix()) {
            return res.status(400).json({
                status: false,
                message: "Pleae enter correct check out date."
            })
        }

        return res.status(200).json({
            status: true,
            message: "Hotel Details Updated Successfully",
            data: await getHotelDetails(aGuest, (checkInDate ? checkInDate : minCheckInDate), (checkOutDate && checkInDate ? checkOutDate : minCheckOutDate), new Types.ObjectId(hotelId))
        })


    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }

}

export default getHotelDetailsController