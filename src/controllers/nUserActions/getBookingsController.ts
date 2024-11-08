import { Request, Response } from "express"
import Constant from "../../Constant/Constant"
import UserAuthRequest from "../../types/users/userAuthRequest"
import getUserBookings from "../../utils/nUserActions/getUserBookings"


const getBookingsController = async (
    req:Request,
    res:Response
) => {

    try {
        

        const decodedData = (req as UserAuthRequest).decodedData
        const { count, page } = req.query
        const aCount = !isNaN(Number(count)) && Number(count) > 0 ? Number(count) : Constant.DEFAULT_SEARCH_COUNT
        const aPage = !isNaN(Number(page)) && Number(page) > 0 ? Number(page) : Constant.DEFAULT_SEARCH_PAGE

        return res.status(200).json({
            status:true,
            message:"Bookings Updated Successfully.",
            data:await getUserBookings(decodedData._id,aCount,aPage)
        })


    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }

}

export default getBookingsController