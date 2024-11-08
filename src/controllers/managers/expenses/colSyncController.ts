import { Request, Response } from "express";
import isDateFormat from "../../../validations/isDateFormat";
import Hotel from "../../../models/hotels/hotelModel";
import colSync from "../../../utils/expense/colSync";
import colUnSync from "../../../../expense/src/utils/sync/colUnsync";


const colSyncController = async (
    req: Request,
    res: Response
) => {

    try {

        const hotelId = req.body.hotelId
        const date = req.body.date
        const isUnSync = Boolean(req.body.isUnSync)
        const days = Number(req.body.days)

        if (!hotelId) {
            return res.status(400).json({ status: false, message: "Please enter correct hotelId." })
        }

        if (!isDateFormat(date)) {
            return res.status(400).json({ status: false, message: "Please enter correct date." })
        }

        const hotel = await Hotel.findOne({ _id: hotelId })

        if (!hotel) {
            return res.status(400).json({ status: false, message: "Please enter correct hotelId." })
        }

        if (isNaN(days) || days < 1) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct no of days"
            })
        }

        if (isUnSync) {
            await colUnSync(date, hotel._id, 1)
        } else {
            await colSync(date, hotel._id, days)
        }
        return res.status(200).json({
            status: true,
            message: "Collection Synced Successfully."
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: true, message: "Please try after some time." })
    }

}

export default colSyncController