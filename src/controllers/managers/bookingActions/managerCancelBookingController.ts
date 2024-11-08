import { Request, Response } from "express";
import moment from "moment-timezone";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import Bookings from "../../../models/bookings/bookingModel";
import { bookingNotifierAsEvent } from "../../../notifiers/bookingNotifiers";
import BookingActions from "../../../utils/booking/bookingActions";
import MoneyFlow from "../../../utils/expense/soucesAndPartners/MoneyFlow";

const managerCancelBooking = async (
  req: Request,
  res: Response
): Promise<Response> => {

  try {

    let bookingId = req.body.bookingId as string

    const decodedData = (req as ManagerAuthRequest).decodedData;

    if (!bookingId) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct bookingId" });
    }

    let booking = await Bookings.findOne({
      bookingId: bookingId,
    }).populate([{ path: "hotelId" }, { path: "userId" }])


    if (!booking) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct bookingId" });
    }
    if (booking.collections.find(it => Boolean(it.transaction))) {
      return res.status(400).json({
          status: false,
          message: "This booking cannot be cancelled."
      })
  }

    const permission = decodedData.permissions.find((perm) => perm.hotel.toString() == booking!.hotelId._id.toString())

    if (
      !permission || !permission.canCancelBooking
    ) {
      return res
        .status(400)
        .json({ status: false, message: "You do not have access." });
    }

    let curdate = moment(new Date());

    if (booking.hasNotShown) {
      return res.status(400).json({
        status: false,
        message: "Booking has already marked as no show.",
      });
    }
    if (booking.isCancelled) {
      return res.status(400).json({
        status: false,
        message: "Booking is already cancelled.",
      });
    }
    if (booking.hasCheckedIn && permission.isTimeBounded) {
      return res.status(400).json({
        status: false,
        message: "Checked In Bookings cannot be cancelled.",
      });
    }

    booking.isCancelled = true

    if (!permission.isTimeBounded && booking.hasCheckedIn) {
      booking.hasCheckedIn = false
      booking.hasCheckedOut = false
      booking.checkInTime = undefined
      booking.checkOutTime = undefined
      booking.checkedInData = undefined
      booking.checkedOutData = undefined
      booking.isPaymentCollected = false
      booking.isMoneyPending = false
      booking.wasMoneyPending = false
      booking.isRoomAssigned = false
      booking.assignedRoom = undefined
      booking.deletedCollections = [
        ...booking.deletedCollections,
        ...booking.collections.map(col => {
          return {
            ...col,
            deletedBy: decodedData._id,
            deletedDate: new Date()
          }
        })
      ]
      await MoneyFlow.DeleteBookingCollection(booking.collections.map(it => it.colId))
      booking.collections = [];
      booking.deletedExtraCharges = [
        ...booking.deletedExtraCharges,
        ...booking.extraCharges.map(ecr => {
          return {
            ...ecr,
            deletedBy: decodedData._id,
            deletedDate: new Date()
          }
        })
      ]
      booking.extraCharges = []
    }

    booking.cancelledData = {
      date: curdate.toDate(),
      cancelledBy: decodedData._id,
      isCancelledByUser: false
    }

    await booking.save()

    return res.status(200).json({
      status: true,
      message: "Booking cancelled successfully.",
      data: await bookingNotifierAsEvent(booking, BookingActions.Cancelled)
    })
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }

};


export default managerCancelBooking