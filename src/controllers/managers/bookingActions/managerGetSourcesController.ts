import { Request, Response } from "express";
import Bookings from "../../../models/bookings/bookingModel";
import Source from "../../../models/expenses/sourceModel";



const managerGetSourcesController = async (
    req: Request,
    res: Response
) => {

    try {

        const bookingId = req.body.bookingId

        const identifier = req.params.identifier

        if (!identifier) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct identifier"
            })
        }

        if (!bookingId) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct booking Id"
            })
        }

        const booking = await Bookings.findOne({ bookingId })

        if (!booking) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct booking Id"
            })
        }

        const sources = await Source.find({ id: booking.hotelId, identifier })

        return res.status(200).json({
            status: true,
            message: "Sources Updated Successfully.",
            data: sources.map(ss => ss.name)
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }

}

export default managerGetSourcesController