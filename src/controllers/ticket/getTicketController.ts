import { Request, Response } from "express"
import Bookings from "../../models/bookings/bookingModel"
import bookingPopulate from "../../utils/booking/populateData"
import moment from "moment"
import IHotel from "../../types/hotels/hotel"

const getTicketController = async (req: Request, res: Response) => {

    try {

        const code = req.params.code as string
        if (!code) {
            return res.status(400).json({ status: false, message: "Please enter correct bookingId." })
        }
        const booking = await Bookings.findOne({ actionCode: code }).populate(bookingPopulate)
        if (!booking) {
            return res.status(400).json({ status: false, message: "Please enter correct bookingId" })
        }
        let statusText = ""
        if (booking.hasCheckedIn && !booking.hasCheckedOut) {
            statusText = "You are now Checked In.<br>Scan for CheckOut"
        } else if (booking.hasCheckedOut) {
            statusText = "You are now Checked Out."
        } else if (!booking.isCancelled && !booking.hasNotShown) {
            statusText = "Scan for check in."
        }
        let data = {
            hotelName:(booking.hotelId as IHotel).hotelName,
            name:booking.name,
            phone:booking.phoneNumber,
            checkIn:moment(booking.checkIn).format("DD-MM-YYYY"),
            checkOut:moment(booking.checkOut).format("DD-MM-YYYY"),
            actionCode:booking.actionCode,
            statusText:statusText,
            bookingId:booking.bookingId,
            rooms:Object.values(booking.bookedRooms).flat().length,
            guests:Object.values(booking.bookedRooms).flat().reduce((acc,cur) => acc + cur ,0)
        }
        return res.render("ticket",data)
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time."
        })
    }

}


export default getTicketController