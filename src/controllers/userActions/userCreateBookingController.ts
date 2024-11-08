import { Request, Response } from "express";
import UserAuthRequest from "../../types/users/userAuthRequest";
import createBooking from "../../utils/booking/createBooking";
import dateManagerForOldApp from "../../validations/dateFormatManagerForOldApp";
import codeGenerate from "../../utils/common/codeGenerate";
import IAllotedRoom from "../../types/bookings/allotedRoom";
import Bookings from "../../models/bookings/bookingModel";
import bookingNotifier from "../../notifiers/bookingNotifiers";
import BookingActions from "../../utils/booking/bookingActions";
import bookingPopulate from "../../utils/booking/populateData";
import bookingUserFormatter from "../../utils/booking/bookingUserFormatter";
import calculatePrice from "../../utils/price/calculatePrice";
import Hotel from "../../models/hotels/hotelModel";
import BookingSource from "../../enums/BookingSource";

const userBookingCreateController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const decodedData = (req as UserAuthRequest).decodedData;

    if (!req.query.hotelId) {
      return res
        .status(400)
        .json({ status: false, message: "Please choose correct hotel." });
    }

  
    const hotel = await Hotel.findOne({ _id: req.query.hotelId });

    if (!hotel) {
      return res.status(400).json({
        status: false,
        message: "Please try after some time",
      });
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

    let rooms: { [key: string]: Array<number> } = req.body.rooms;

    if(Array.isArray(req.body.rooms)){
      // let oRooms :Array<IOldRoom> = req.body.rooms
      // let newRoom : { [key: string]: Array<number> } = {}
      // oRooms.forEach(room => {
      //   newRoom[room.roomType] = room.noOfGuests
      // })
      // rooms = newRoom
      return res
        .status(400)
        .json({ status: false, message: "Please try after some time." });
    }

    let checkInTime = dateManagerForOldApp(req.body.checkInTime);
    let checkOutTime = dateManagerForOldApp(req.body.checkOutTime);

  
    let status = await createBooking(
      hotel,
      checkInTime ? checkInTime : req.body.checkInTime,
      checkOutTime ? checkOutTime : req.body.checkOutTime,
      rooms,
      decodedData.name,
      decodedData.phoneNumber,
      decodedData.email,
      true
    );

    if (!status.status) {
      return res.status(400).json({ status: false, message: status.message });
    }
    if (!status.data) {
      return res.status(400).json({ status: false, message: status.message });
    }


    const price =await calculatePrice(
      hotel,
      rooms,
      status.data.checkInTime,
      status.data.checkOutTime,
    );

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
      amount: price,
      bookingAmount: price,
      isCreatedByManager: false,
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
      createdAt: status.data.curdate,
    });
    booking.bookingSource = BookingSource.Oxy
    let book = await (await booking.save()).populate(bookingPopulate);

    bookingNotifier(booking, BookingActions.Created); //notidying all
    return res.status(200).json({
      status: true,
      message: "Booking Created Successfuly",
      data: JSON.stringify(bookingUserFormatter(booking)),
    });
  } catch (err) {
  
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default userBookingCreateController;
