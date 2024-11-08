import { Request, Response } from "express";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import Bookings from "../../../models/bookings/bookingModel";
import moment from "moment-timezone";
import { bookingNotifierAsEvent } from "../../../notifiers/bookingNotifiers";
import BookingActions from "../../../utils/booking/bookingActions";
import codeGenerate from "../../../utils/common/codeGenerate";
import MoneyFlow from "../../../utils/expense/soucesAndPartners/MoneyFlow";
import BookingIdEncryptAndDecrypt from "../../../utils/booking/idEncryptAndDecrypt";
import RazorpayTransactionDetailsModel from "../../../models/razorpay/SuccessfulTransaction";

const managerCollectPayment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    let bookingId = req.body.bookingId as string;

    const decodedData = (req as ManagerAuthRequest).decodedData;

    if (!bookingId) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct bookingId" });
    }

    const booking = await Bookings.findOne({
      bookingId: bookingId,
    }).populate([{ path: "hotelId" }, { path: "userId" }])

    if (!booking) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct bookingId" });
    }

    const permission = decodedData.permissions.find((perm) => perm.hotel.toString() == booking.hotelId._id.toString())

    if (
      !permission || !permission.canUpdatePayment
    ) {
      return res
        .status(400)
        .json({ status: false, message: "You do not have access." });
    }


    let curdate = moment(new Date());

    if (booking.hasNotShown) {
      return res.status(400).json({
        status: false,
        message: "Booking has been marked as No Show.",
      });
    }

    if (booking.isCancelled) {
      return res.status(400).json({
        status: false,
        message: "Booking has been Cancelled.",
      });
    }


    const cash = !isNaN(req.body.payment.cash) ? req.body.payment.cash : 0;
    const bank = !isNaN(req.body.payment.bank) ? req.body.payment.bank : 0;
    const ota = !isNaN(req.body.payment.ota) ? req.body.payment.ota : 0;


    if (cash + bank + ota == 0) {

      if (req.body.jsonObject && JSON.parse(req.body.jsonObject).txn && JSON.parse(req.body.jsonObject).bookingIdEncryption && (
        BookingIdEncryptAndDecrypt.decryptId(JSON.parse(req.body.jsonObject).bookingIdEncryption) == booking.bookingId
      )) {

        const transaction = JSON.parse(req.body.jsonObject).txn
        const txnId = transaction.txnId
        const deviceSerial = transaction.deviceSerial
        const amountOriginal = transaction.amountOriginal

        let thatCollection = booking.collections.find((collection) => {
          return collection.transaction && collection.transaction.txnId == txnId
        })

        if (!thatCollection) {

          const requiredTotal = booking.amount;
          const paidTotal = booking.collections.reduce(
            (acc, cur) => acc + cur.total,
            0
          );

          const total = cash + bank + ota;

          if (total > requiredTotal - paidTotal) {
            return res.status(400).json({
              status: false,
              message: "Collection cannot be greater than amount.",
            });
          }

          if (booking.isPaymentCollected) {
            if (booking.wasMoneyPending) {
              booking.isMoneyPending = total < requiredTotal - paidTotal;
            }
          } else {
            booking.isMoneyPending = total < requiredTotal - paidTotal;
            booking.wasMoneyPending = total < requiredTotal - paidTotal;
            booking.isPaymentCollected = true;
          }

          let colId = txnId

          const successTransaction = await RazorpayTransactionDetailsModel.findOne({
            txnId: txnId
          })

          booking.collections.push({
            date: curdate.toDate(),
            cash: cash,
            bank: bank,
            ota: ota,
            by: decodedData._id,
            total: Number(transaction.amountOriginal),
            colId: colId,
            curDate: new Date(),
            transaction: {
              method: `TID-${deviceSerial}`,
              isVerified: Boolean(successTransaction && successTransaction.status == "AUTHORIZED" && successTransaction?.amount == Number(transaction.amountOriginal)),
              txnId: txnId,
              paymentMode:transaction.paymentMode,
            }
          });
          await booking.save();

          if (successTransaction && successTransaction.status == "AUTHORIZED" && successTransaction?.amount == Number(transaction.amountOriginal)) {
            await MoneyFlow.AddBookingCollection(
              colId,
              `TID-${deviceSerial}`,
              Number(amountOriginal),
              booking.hotelId._id,
              booking._id,
              curdate.toDate()
            )
          }
        }

        return res
          .status(200)
          .json({
            status: true,
            message: "Collected Successfully.",
            data: await bookingNotifierAsEvent(booking, BookingActions.PaymentCollected)
          });

      }

      return res.status(400).json({
        status: false,
        message: "Please enter correct values.",
      });
    }

    if (permission.canPutCustomDate && !permission.isTimeBounded) {
      let date = req.body.date
      const parsedDate = moment.tz(`${date} 16:00:00`, "DD-MM-YYYY HH:mm:ss", "Asia/Kolkata")
      if (parsedDate.isValid()) {
        curdate = parsedDate
      }
    }

    const requiredTotal = booking.amount;
    const paidTotal = booking.collections.reduce(
      (acc, cur) => acc + cur.total,
      0
    );

    const total = cash + bank + ota;

    if (total > requiredTotal - paidTotal) {
      return res.status(400).json({
        status: false,
        message: "Collection cannot be greater than amount.",
      });
    }

    if (booking.isPaymentCollected) {
      if (booking.wasMoneyPending) {
        booking.isMoneyPending = total < requiredTotal - paidTotal;
      }
    } else {
      booking.isMoneyPending = total < requiredTotal - paidTotal;
      booking.wasMoneyPending = total < requiredTotal - paidTotal;
      booking.isPaymentCollected = true;
    }

    let colId = codeGenerate(12)
    booking.collections.push({
      date: curdate.toDate(),
      cash: cash,
      bank: bank,
      ota: ota,
      by: decodedData._id,
      total: total,
      colId,
      curDate: new Date()
    });
    await booking.save();
    // bookingNotifier(booking, BookingActions.PaymentCollected)
    await MoneyFlow.AddBookingCollection(
      colId,
      (cash != 0 ? "Cash" : (bank != 0 ? "Bank" : (ota != 0 ? "Ota" : ""))),
      (cash != 0 ? cash : (bank != 0 ? bank : (ota != 0 ? ota : 0))),
      booking.hotelId._id,
      booking._id,
      curdate.toDate()
    )

    return res
      .status(200)
      .json({
        status: true,
        message: "Collected Successfully.",
        data: await bookingNotifierAsEvent(booking, BookingActions.PaymentCollected)
      });

  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default managerCollectPayment;
