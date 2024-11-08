import { Request, Response } from "express";
import getMostVisitedHotels from "../../utils/nUserActions/getMostVisitedHotels";


const getMostVisitedHotelController = async (
    req: Request,
    res: Response
) => {
    try {


        return res.status(200).json({
            status: true,
            message: "Hotels updated successfully.",
            data: await getMostVisitedHotels()
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }
}

export default getMostVisitedHotelController