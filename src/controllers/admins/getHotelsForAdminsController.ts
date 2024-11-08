import { Response, Request } from "express";
import Hotel from "../../models/hotels/hotelModel";

const adminGetHotelsForAdminsController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const hotels = await Hotel.find().populate("reviews");

        return res
            .status(200)
            .json({
                status: true,
                message: "Hotels Loaded Successfully",
                data: JSON.stringify(hotels.map(hotel => hotel.toObject({
                    transform: function (doc, ret) {
                        if (!ret.nearBy) {
                            ret.nearBy = {}
                        }
                    }
                }))),
            });

    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({ status: false, message: "Please try after some time." });
    }

};


export default adminGetHotelsForAdminsController