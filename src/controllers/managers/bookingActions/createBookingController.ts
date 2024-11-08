import { Request, Response } from "express";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import createBooking from "../../../utils/booking/createBooking";
import Bookings from "../../../models/bookings/bookingModel";
import codeGenerate from "../../../utils/common/codeGenerate";
import IAllotedRoom from "../../../types/bookings/allotedRoom";
import bookingNotifier from "../../../notifiers/bookingNotifiers";
import BookingActions from "../../../utils/booking/bookingActions";
import Hotel from "../../../models/hotels/hotelModel";
import BookingSource from "../../../enums/BookingSource";

const managerCreateBookingController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {

    let phoneNumber = req.body.phone

    let isConvenience = req.body.isConvenience;
    let convenienceData = req.body.convenienceData;
    let isAdvancedPayment = req.body.isAdvancedPayment;
    let advancedPaymentData = req.body.advancedPaymentData;
    let advancedPaymentMethod = req.body.advancedPaymentMethod;

    const decodedData = (req as ManagerAuthRequest).decodedData;


    if (!req.body.name) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct name." });
    }

    if (!phoneNumber || String(phoneNumber).length != 10) {
      return res.status(400).json({
        status: false,
        message: "Please enter correct phone number with country code.",
      });
    }

    if (!req.query.hotelId) {
      return res
        .status(400)
        .json({ status: false, message: "Please choose correct hotel." });
    }

    const hotel = await Hotel.findOne({ _id: req.query.hotelId });

    if (!hotel) {
      return res.status(400).json({
        status: false,
        message: "Please try after some time.",
      });
    }

    let permission = decodedData.permissions.find(perm => perm.hotel.toString() == hotel._id)

    if (!permission || !permission.canCreateBooking) {
      return res.status(400).json({
        status: false,
        message: "You do not have permission to create booking."
      })
    }

    if (!req.body.checkInTime || !req.body.checkOutTime) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct stay dates." });
    }

    if (!req.body.rooms) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct rooms." });
    }
    if (!req.body.price || isNaN(req.body.price)) {
      return res.status(400).json({ status: false, message: "Please Provide Correct Price" });
    }

    let rooms: { [key: string]: Array<number> } = req.body.rooms;


    let status = await createBooking(
      hotel,
      req.body.checkInTime,
      req.body.checkOutTime,
      rooms,
      req.body.name,
      `91${phoneNumber}`,
      req.body.email,
      permission.isTimeBounded
    );

    if (!status.status) {
      return res.status(400).json({ status: false, message: status.message });
    }
    if (!status.data) {
      return res.status(400).json({ status: false, message: status.message });
    }

    const noOfRooms = Object.keys(rooms).map(a => {
      return rooms[a].length
    }).reduce((acc, cur) => acc + cur, 0)

    let booking = new Bookings({
      hotelId: req.query.hotelId,
      userId: status.data.user._id,
      name: status.data.user.name,
      phoneNumber: status.data.user.phoneNumber,
      checkIn: status.data.checkInTime,
      checkOut: status.data.checkOutTime,
      actualCheckIn: status.data.checkInTime,
      actualCheckOut: status.data.checkOutTime,
      canStayCheckIn: status.data.canStayCheckIn,
      bookedRooms: req.body.rooms,
      amount: Number(req.body.price) * status.data.day * noOfRooms,
      bookingAmount: Number(req.body.price) * status.data.day * noOfRooms,
      isCreatedByManager: true,
      createdBy: decodedData._id,
      actionCode: codeGenerate(6),
      bookingId: codeGenerate(8),
      allotedRooms: Object.keys(rooms).map((room): IAllotedRoom => {
        return {
          roomType: room,
          noOfRooms: rooms[room].length,
          noOfGuests: rooms[room],
          startDate: status.data!.checkInTime.toDate(),
          endDate: status.data!.checkOutTime.toDate(),
        };
      }),
      timezone: status.data.timezone,
      hotelCheckInTime: status.data.hotelCheckInTime,
      hotelCheckOutTime: status.data.hotelCheckOutTime,
      createdAt: status.data.curdate
    });


    if (isConvenience) {
      if (
        convenienceData.length != 0 &&
        !isNaN(convenienceData) &&
        Number(convenienceData) >= 0
      ) {
        booking.isConveniencePayment = true;
        booking.convenienceAmount = Number(convenienceData) * status.data.day * noOfRooms;
        booking.amount = booking.amount + Number(convenienceData) * status.data.day * noOfRooms;
      } else {
        return res.status(400).json({
          status: false,
          message: "Please Enter Correct Convenience Charge",
        });
      }
    }
    booking.referenceId = req.body.referenceId;
    booking.bookingSource = req.body.referenceId ? BookingSource.Ota : BookingSource.Walking

    if (isAdvancedPayment) {
      if (
        advancedPaymentData.length != 0 &&
        !isNaN(advancedPaymentData) &&
        Number(advancedPaymentData) >= 0
      ) {
        let method = advancedPaymentMethod.toLowerCase();
        if (!["cash", "bank", "ota"].includes(method)) {
          return res.status(400).json({
            status: false,
            message: "Please Enter Correct Advanced Payment Method",
          });
        }
        booking.isAdvancedPayment = true;
        let coldId = codeGenerate(12)
        booking.advancedPaymentData = {
          total: Number(advancedPaymentData),
          cash: method == "cash" ? Number(advancedPaymentData) : 0,
          bank: method == "bank" ? Number(advancedPaymentData) : 0,
          ota: method == "ota" ? Number(advancedPaymentData) : 0,
          date: new Date(),
          by: decodedData._id,
          colId: coldId,
          curDate:new Date()
        };
        booking.isPaymentCollected = true
        booking.collections.push({
          total: Number(advancedPaymentData),
          cash: method == "cash" ? Number(advancedPaymentData) : 0,
          bank: method == "bank" ? Number(advancedPaymentData) : 0,
          ota: method == "ota" ? Number(advancedPaymentData) : 0,
          date: new Date(),
          by: decodedData._id,
          colId: coldId,
          curDate:new Date()
        })
      } else {
        return res.status(400).json({
          status: false,
          message: "Please Enter Correct Advanced Payment",
        });
      }
    }

    await booking.save();

    bookingNotifier(booking, BookingActions.Created) //notidying all

    return res
      .status(200)
      .json({ status: true, message: "Booking Created Successfuly" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default managerCreateBookingController;
