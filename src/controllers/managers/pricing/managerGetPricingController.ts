import { Request, Response } from "express"
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import Hotel from "../../../models/hotels/hotelModel";
import getPricing from "../../../utils/pricing/getPricing";

const managerGetPricingController = async (req: Request, res: Response) => {

    try {
        let hotelIds: string[] = [];
        const decodedData = (req as ManagerAuthRequest).decodedData;

        if (
            req.query.hotelId &&
            decodedData.permissions.find(
                (perm) =>
                    perm.hotel.toString() == req.query.hotelId && perm.canViewBooking
            )
        ) {
            hotelIds.push(req.query.hotelId as string);
        } else if (!req.query.hotelId) {
            hotelIds = decodedData.permissions
                // .filter((perm) => perm.canViewPricing)
                .filter((perm) => true)
                .map((perm) => perm.hotel.toString());
        } else {
            return res
                .status(400)
                .json({ staus: false, message: "You do not have access." });
        }
        const hotels = await Hotel.find({ _id: { $in: hotelIds } })
        const pricings = await getPricing(hotels)
   
        return res.status(200).json({status:true,message:"Prices updated successfuly",data:pricings})
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: true, message: "Please try after some time." })
    }

}

export default managerGetPricingController