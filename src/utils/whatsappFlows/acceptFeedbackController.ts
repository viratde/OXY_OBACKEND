import { Request, Response } from "express"
import Bookings from "../../models/bookings/bookingModel"

const acceptFeedbackController = async (
    req: Request,
    res: Response
) => {

    try {

        const data = req.body
        if (data.token != "sdkjhqdhlhdjahdhasdhuadiushiishdish") {
            return res.status(200).json({
                status: false,
                message: "Token Mismatch"
            })
        }
        const bookingId = req.body.bookingId
        const from = req.body.from

        if (!bookingId) {
            return res.status(200).json({
                status: false,
                message: "BookingId Not Found"
            })
        }

        const booking = await Bookings.findOne({ bookingId, phoneNumber: from })
        if (!booking) {
            return res.status(200).json({
                status: false,
                message: "Booking Not Found"
            })
        }

        const check_in_experience = Number(req.body.check_in_experience)
        const staff_frendiliness = Number(req.body.staff_frendiliness)
        const amenities_provided = Number(req.body.amenities_provided)
        const room_ceanliness = Number(req.body.room_ceanliness)
        const room_comfort = Number(req.body.room_comfort)
        const suggestion = req.body.suggestion as string

        if (
            isNaN(check_in_experience) ||
            isNaN(staff_frendiliness) ||
            isNaN(amenities_provided) ||
            isNaN(room_ceanliness) ||
            isNaN(room_comfort)
        ) {
            return res.status(200).json({
                status: false,
                message: "Unknown Payload"
            })
        }

        booking.feedback = {
            staff_frendiliness,
            check_in_experience,
            room_ceanliness,
            room_comfort,
            amenities_provided,
            suggestion,
            date:new Date()
        }
        await booking.save()

        return res.status(200).json({
            status: false,
            message: "FeedBack Successfully Saved."
        })

    } catch (err) {
        console.log(err)
        return res.status(200).json({ status: true, message: "Please try after some time." })
    }

}


export default acceptFeedbackController