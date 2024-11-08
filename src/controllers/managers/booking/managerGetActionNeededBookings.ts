import { Request, Response } from "express";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import managerBookingFormatter from "../../../utils/booking/bookingFormatter";
import IBooking from "../../../types/bookings/booking";
import moment from "moment-timezone";
import Bookings from "../../../models/bookings/bookingModel";
import bookingPopulate from "../../../utils/booking/populateData";
import BookingTypeFormatterHelper from "../../../utils/booking/BookingTypeFormatterHelper";

const managerGetActionNeededBookings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {

    let curdate = moment(new Date());
    let hotelIds: string[] = [];
    let purDate = moment(new Date()).subtract(1,"day")

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

    const bookings = await Bookings.find({
      hotelId: {
        $in: hotelIds
      },
      hasNotShown: false,
      isCancelled: false,
      hasCheckedOut: false,
      $and:[
        {
            actualCheckOut:{
                $lt:curdate
            }
        },
        {
            actualCheckOut:{
                $gte:purDate
            } 
        }
    ]
    }).populate(bookingPopulate);

    return res.status(200).json({
      status: true,
      message: "Bookings Updated Successfully.",
      data: bookings.map((book) => managerBookingFormatter(book,BookingTypeFormatterHelper.ActionNeeded)),
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default managerGetActionNeededBookings;
