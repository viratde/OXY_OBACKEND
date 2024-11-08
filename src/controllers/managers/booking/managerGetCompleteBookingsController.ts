import { Request, Response } from "express";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import managerBookingFormatter from "../../../utils/booking/bookingFormatter";
import isDateFormat from "../../../validations/isDateFormat";
import Bookings from "../../../models/bookings/bookingModel";
import moment from "moment-timezone";
import bookingPopulate from "../../../utils/booking/populateData";
import IBooking from "../../../types/bookings/booking";
import BookingTypeFormatterHelper from "../../../utils/booking/BookingTypeFormatterHelper";

const managerGetCompleteBookings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!isDateFormat(req.body.date)) {
      return res
        .status(400)
        .json({ status: true, message: "Please enter correct date." });
    }

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
    let aTime = moment.tz(`${req.body.date} 00:00:00`, "DD-MM-YYYY HH:mm:ss", "UTC")
    let startTime = aTime.clone().subtract(12, "hours")
    let endTime = aTime.clone().add(36, "hours")


    let bookings = await Bookings.find({
      hotelId: {
        $in: hotelIds
      },
      $or: [
        {
          $and: [
            {
              actualCheckOut: {
                $gte: startTime
              },
            },
            {
              actualCheckOut: {
                $lt: endTime
              }
            }
          ]
        },
        {
          $and: [
            {
              "noShowData.date": {
                $gte: startTime
              },
            },
            {
              "noShowData.date": {
                $lt: endTime
              }
            }
          ]
        },
        {
          $and: [
            {
              "cancelledData.date": {
                $gte: startTime
              },
            },
            {
              "cancelledData.date": {
                $lt: endTime
              }
            }
          ]
        },
      ]
    }).populate(bookingPopulate);


    bookings = bookings.filter((book: IBooking) => {
      if ((moment(book.actualCheckOut).tz(book.timezone).format("DD-MM-YYYY")) == req.body.date) {
        return true
      } else if (book.hasCheckedOut && (moment(book.checkOutTime).tz(book.timezone).format("DD-MM-YYYY")) == req.body.date) {
        return true
      } else if (book.hasNotShown && (moment(book.noShowData!.date).tz(book.timezone).format("DD-MM-YYYY")) == req.body.date) {
        return true
      } else if (book.isCancelled && (moment(book.cancelledData!.date).tz(book.timezone).format("DD-MM-YYYY")) == req.body.date) {
        return true
      } else {
        return false
      }
    })

    return res.status(200).json({
      status: true,
      message: "Bookings Updated Successfully.",
      data: bookings.map((book) => managerBookingFormatter(book,BookingTypeFormatterHelper.Completed)),
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: true, message: "Please try after some time." });
  }
};

export default managerGetCompleteBookings;
