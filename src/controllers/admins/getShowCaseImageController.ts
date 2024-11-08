import { Request, Response } from "express";
import Hotel from "../../models/hotels/hotelModel";


const getShowCaseImageController = async (
    req: Request,
    res: Response
) => {


    try {

        const hotels = await Hotel.find({isHotelListed:true}, "imageData")
        return res.status(200).json({
            status: true,
            message: "Image Updated Successfully.",
            data: hotels.map(a => Object.values(a.imageData)).flat().flat()
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }

}

export default getShowCaseImageController