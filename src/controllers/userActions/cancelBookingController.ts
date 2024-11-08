import { Request, Response } from "express";
import Bookings from "../../models/bookings/bookingModel";
import moment from "moment";
import bookingNotifier from "../../notifiers/bookingNotifiers";
import BookingActions from "../../utils/booking/bookingActions";
import UserAuthRequest from "../../types/users/userAuthRequest";
import MoneyFlow from "../../utils/expense/soucesAndPartners/MoneyFlow";

const cancelBookingController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {

    const decodedData = (req as UserAuthRequest).decodedData
    const bookingId = req.query.bookingId;

    if (!bookingId) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct bookingId." });
    }

    const booking = await Bookings.findOne({ bookingId: bookingId });

    if (!booking) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct bookingId" });
    }

    let todayDateInMillis = new Date(
      new Date().toISOString().slice(0, 10)
    ).getTime();
    let bookingTimeInMillis = new Date(booking.checkOut).getTime();

    if (
      !(
        !booking.isCancelled &&
        !booking.hasCheckedOut &&
        !booking.hasCheckedIn &&
        !booking.hasNotShown &&
        todayDateInMillis - bookingTimeInMillis <= 0
      )
    ) {
      return res
        .status(400)
        .json({ status: true, message: "This booking cannot be cancelled" });
    }

    booking.isCancelled = true;


    booking.isPaymentCollected = false
    booking.isMoneyPending = false
    booking.wasMoneyPending = false
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

    booking.cancelledData = {
      isCancelledByUser: true,
      date: moment(new Date()).toDate(),
      cancelledBy: null,
    };
    await booking.save();
    bookingNotifier(booking, BookingActions.Cancelled); 
    return res
      .status(200)
      .json({ status: true, message: "Booking cancelled Successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      message: "Please try after some time.",
    });
  }
};

export default cancelBookingController;
