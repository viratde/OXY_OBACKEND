import { Request, Response } from "express";
import isDateFormat from "../../../validations/isDateFormat";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import { Types } from "mongoose";
import getBookingCollectionAnalytics from "../../../utils/accountAnalytics/getBookingCollectionAnalytics";


const managerGetBookingCollectionAnalyticsController = async (
    req: Request,
    res: Response
): Promise<Response> => {

    try {

        const { startDay, days, isTable } = req.body;

        if (!days || isNaN(days)) {
            return res.status(200).json({ status: false, message: "Please enter correct range" })
        }

        if (!startDay || !isDateFormat(startDay)) {
            return res.status(200).json({ status: false, message: "Please enter correct start date." })
        }

        if (isTable == undefined) {
            return res.status(200).json({ status: false, message: "Please enter correct data format." })
        }

        let hotelIds: string[] = [];

        const decodedData = (req as ManagerAuthRequest).decodedData;

        if (
            req.query.hotelId &&
            decodedData.permissions.find(
                (perm) =>
                    perm.hotel.toString() == req.query.hotelId && perm.canViewAnalytics
            )
        ) {
            hotelIds.push(req.query.hotelId as string);
        } else if (!req.query.hotelId) {
            hotelIds = decodedData.permissions
                .filter((perm) => perm.canViewBooking)
                .map((perm) => perm.hotel.toString());
        } else {
            return res
                .status(400)
                .json({ staus: false, message: "You do not have access." });
        }

        if (hotelIds.length == 0) {
            return res
                .status(400)
                .json({ staus: false, message: "You do not have access." });
        }

        const data = await getBookingCollectionAnalytics(startDay, days, isTable, hotelIds.map(hot => new Types.ObjectId(hot)))
        return res.status(200).json({ status: true, message: "Updated Successfully", data: data })
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({ status: false, message: "Please try after some time." });
    }
};

export default managerGetBookingCollectionAnalyticsController