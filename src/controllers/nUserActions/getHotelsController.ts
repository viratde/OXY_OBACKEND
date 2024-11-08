import { Request, Response } from "express";
import getHotels from "../../utils/nUserActions/getHotels";
import moment from "moment-timezone";
import getLatLngFromPlaceId from "../../utils/nUserActions/getLatLngFromPlaceId";
import Constant from "../../Constant/Constant";


const getHotelsController = async (
    req: Request,
    res: Response
) => {

    try {

        const { count, page, guests, checkIn, checkOut, lat, lng, placeId } = req.query

        const aCount = !isNaN(Number(count)) && Number(count) > 0 ? Number(count) : Constant.DEFAULT_SEARCH_COUNT
        const aPage = !isNaN(Number(page)) && Number(page) > 0 ? Number(page) : Constant.DEFAULT_SEARCH_PAGE
        const aGuest = guests && typeof guests == "string" && guests.split(",").every(g => !isNaN(Number(g)) && Number(g) > 0) ? guests.split(",").map(g => Number(g)) : Constant.DEFAULT_SEARCH_GUESTS_AND_ROOM
        let aPlaceId = placeId ? String(placeId) : undefined
        let aLat = aPlaceId ? undefined : Number(lat)
        let aLng = aPlaceId ? undefined : Number(lng)

        if (!aLat && !aLng && !aPlaceId) {
            aPlaceId = Constant.DEFAULT_PLACE_ID
        }


        const timeline = Constant.DEAFULT_TIMELINE
        const checkInTime = Constant.CHECK_IN_TIME
        const checkOutTime = Constant.CHECK_OUT_TIME




        const minCheckInDate = moment(new Date()).tz(timeline).hours(12).minutes(0).seconds(0).milliseconds(0)
        const minCheckOutDate = minCheckInDate.clone().add(23, 'hour')

        const checkInDate = checkIn ? (moment.tz(`${checkIn}-${checkInTime}`, "DD-MM-YYYY-HH-mm-ss", timeline)).millisecond(0) : undefined
        const checkOutDate = checkOut ? (moment.tz(`${checkOut}-${checkOutTime}`, "DD-MM-YYYY-HH-mm-ss", timeline)).millisecond(0) : undefined


        if (checkInDate && checkInDate.unix() < minCheckInDate.unix()) {
            return res.status(400).json({
                status: false,
                message: "Pleae enter correct check in date."
            })
        }

        if (checkOutDate && checkInDate && checkOutDate.unix() < checkInDate.unix() && checkOutDate.unix() < minCheckOutDate.unix()) {
            return res.status(400).json({
                status: false,
                message: "Pleae enter correct check out date."
            })
        }

        if (aGuest.length < 1) {
            return res.status(400).json({
                status: false,
                message: "Pleae enter correct no of guests."
            })
        }

        if (aPlaceId) {
            const location = await getLatLngFromPlaceId(aPlaceId)
            if (!location) {
                return res.status(400).json({
                    status: false,
                    message: "Please try after some time"
                })
            }
            aLat = location.lat
            aLng = location.lng
        }

        if (isNaN(Number(aLat)) || isNaN(Number(aLat)) || !aLat || !aLng) {
            return res.status(400).json({
                status: false,
                message: "Pleae enter correct location."
            })
        }


        return res.status(200).json({
            status: true,
            message: "Hotels Updated Successfully.",
            data: await getHotels(aCount, aPage, (checkInDate ? checkInDate : minCheckInDate), (checkOutDate && checkInDate ? checkOutDate : minCheckOutDate), aGuest, { lat: aLat, lng: aLng })
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }

}

export default getHotelsController