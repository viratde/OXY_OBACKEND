import { Request, Response } from "express";
import isDateFormat from "../../../validations/isDateFormat";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import accountAnalyticsWrapper from "../../../utils/accountAnalytics/accountAnalyticsWrapper";
import { Types } from "mongoose";

const managerGetAccountingAnalytics = async (
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

    const data = await accountAnalyticsWrapper(startDay, days, hotelIds.map(id => new Types.ObjectId(id)),isTable)
    return res.status(200).json({ status: true, message: "Updated Successfully", data: JSON.stringify(data) })
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default managerGetAccountingAnalytics;
