import { Request, Response } from "express";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import Bookings from "../../../models/bookings/bookingModel";
import moment from "moment-timezone";
import IExtraCharge, { ExtraChargeTypes } from "../../../types/bookings/ExtraCharge";
import findAccountingDates from "../../../utils/accounts/findDate";
import isDateFormat from "../../../validations/isDateFormat";
import { bookingNotifierAsEvent } from "../../../notifiers/bookingNotifiers";
import BookingActions from "../../../utils/booking/bookingActions";
import codeGenerate from "../../../utils/common/codeGenerate";


const managerAddExtraCharge = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    let bookingId = req.body.bookingId as string;
    let type = req.body.type as ExtraChargeTypes;
    let note = req.body.note as string;
    let amount = req.body.amount as number;

    if (!Object.values(ExtraChargeTypes).includes(type)) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct charge type." });
    }

    if (!note) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct note." });
    }

    if (amount == undefined) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct amount." });
    }

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
      !permission || !permission.canAddExtraPrice
    ) {
      return res
        .status(400)
        .json({ status: false, message: "You do not have access." });
    }
    let curdate = moment(new Date());

    if (moment(booking.actualCheckOut).unix() < curdate.unix() && type != ExtraChargeTypes.LateCheckOut && permission.isTimeBounded) {
      return res.status(400).json({
        status: false,
        message: "Extra Charge cannot be added to this booking now.",
      });
    }

    if (booking.hasNotShown) {
      return res.status(400).json({
        status: false,
        message: "Extra Charge cannot be added to no show bookings.",
      });
    }

    if (booking.isCancelled) {
      return res.status(400).json({
        status: false,
        message: "Extra Charge cannot be added to cancelled bookings.",
      });
    }

    if (booking.hasCheckedOut && permission.isTimeBounded) {
      return res.status(400).json({
        status: false,
        message: "Extra Charge cannot be added to checked out bookings.",
      });
    }

    let extraCharges: IExtraCharge[] = [];

    if (
      type == ExtraChargeTypes.EarlyCheckIn ||
      type == ExtraChargeTypes.LateCheckOut
    ) {

      if (booking.extraCharges.find(extra => extra.type == type)) {
        return res.status(400).json({
          status: false,
          message: `${type} Charge has been already added.`,
        });
      }

      let time = req.body.extendedBy as number;
      const dates = findAccountingDates(
        booking.canStayCheckIn,
        booking.checkOut
      );

      extraCharges = [
        {
          date: curdate.toDate(),
          revenueAmount: amount,
          revenueDate:
            type == ExtraChargeTypes.EarlyCheckIn
              ? dates[0]
              : dates[dates.length - 1],
          addedBy: decodedData._id,
          note: note,
          type: type,
          extendedTime: time,
          ecId: codeGenerate(12)
        },
      ];



    } else {

      let revenue: { [key: string]: number } = req.body.revenues;

      let dates: Array<string> = Object.keys(revenue)
      let revenues: Array<number> = dates.map(value => revenue[value])

      if (!Array.isArray(dates)) {
        return res.status(400).json({ status: false, message: "Please enter correct revenues" })
      }

      if (!Array.isArray(revenues)) {
        return res.status(400).json({ status: false, message: "Please enter correct revenues" })
      }

      for (let i = 0; i < dates.length; i++) {
        if (!isDateFormat(dates[i])) {
          return res.status(400).json({
            status: false,
            message: "Please choose correct dates.",
          });
        }
      }

      let actualDates = dates.map((date) => {
        return moment(booking.canStayCheckIn)
          .date(Number(date.slice(0, 2)))
          .month(Number(date.slice(3, 5)) - 1)
          .year(Number(date.slice(6)))
          .toDate();
      });

      const aDates = findAccountingDates(
        booking.canStayCheckIn,
        booking.checkOut
      );
      const sDates = aDates.map((date) => JSON.stringify(date));

      if (!actualDates.every((date) => sDates.includes(JSON.stringify(date)))) {
        return res.status(400).json({
          status: false,
          message: "Please choose correct dates.",
        });
      }

      if (
        !dates ||
        !revenues ||
        dates.length != revenues.length ||
        revenues.reduce((acc, cur) => acc + cur, 0) != amount
      ) {
        return res.status(400).json({
          status: false,
          message: "Please choose correct dates and revenues.",
        });
      }

      for (let i = 0; i < actualDates.length; i++) {
        extraCharges.push({
          note: note,
          addedBy: decodedData._id,
          revenueAmount: revenues[i],
          revenueDate: actualDates[i],
          type: type,
          extendedTime: undefined,
          date: curdate.toDate(),
          ecId: codeGenerate(12)
        });
      }
    }

    if (type == ExtraChargeTypes.EarlyCheckIn) {
      booking.actualCheckIn = moment(booking.actualCheckIn).subtract(extraCharges[0].extendedTime!, "minutes").toDate()
    } else if (type == ExtraChargeTypes.LateCheckOut) {
      booking.actualCheckOut = moment(booking.actualCheckOut).add(extraCharges[0].extendedTime!, "minutes").toDate()
    }

    booking.extraCharges = [
      ...(booking.extraCharges),
      ...extraCharges
    ]

    booking.amount = booking.amount + amount
    booking.isMoneyPending = amount > 0
    await booking.save()
    return res.status(200).json({
      status: true,
      message: "Charge Added Successfully",
      data: await bookingNotifierAsEvent(booking, BookingActions.ExtraPriceAdded)
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default managerAddExtraCharge;
