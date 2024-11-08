import { Request, Response } from "express";
import Bookings from "../../../models/bookings/bookingModel";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import moment from "moment-timezone";
import IRoom from "../../../types/hotels/room";
import IHotel from "../../../types/hotels/hotel";
import { bookingNotifierAsEvent } from "../../../notifiers/bookingNotifiers";
import BookingActions from "../../../utils/booking/bookingActions";

const managerAssignRoom = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {

    let bookingId = req.body.bookingId as string;
    let rooms: [{ [key: string]: string }] = req.body.rooms;

    if (!Array.isArray(rooms)) {
      return res
        .status(400)
        .json({ status: false, message: "Please choose correct rooms." });
    }

    const decodedData = (req as ManagerAuthRequest).decodedData;

    if (!bookingId) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct bookingId" });
    }

    const booking = await Bookings.findOne({
      bookingId: bookingId,
    }).populate([{ path: "hotelId" }, { path: "userId" }]);

    if (!booking) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct bookingId" });
    }
    const permission = decodedData.permissions.find((perm) => perm.hotel.toString() == booking.hotelId._id.toString())

    if (
      !permission || !permission.canAssignRoom
    ) {
      return res
        .status(400)
        .json({ status: false, message: "You do not have access." });
    }

    let curdate = moment(new Date());

    if (moment(booking.actualCheckOut).unix() < curdate.unix() && permission.isTimeBounded) {
      return res.status(400).json({
        status: false,
        message: "Rooms cannot be assigned to this booking now.",
      });
    }

    if (booking.hasNotShown) {
      return res.status(400).json({
        status: false,
        message: "Rooms cannot be assigned to no show bookings.",
      });
    }
    if (booking.isCancelled) {
      return res.status(400).json({
        status: false,
        message: "Rooms cannot be assigned to cancelled bookings.",
      });
    }

    if (!booking.hasCheckedIn) {
      return res.status(400).json({
        status: false,
        message: "Booking has not been checked in yet.",
      });
    }

    if (booking.hasCheckedOut) {
      return res.status(400).json({
        status: false,
        message: "Rooms cannot be assigned to checked out bookings.",
      });
    }

    const bookings = await Bookings.find({
      hotelId: {
        $in: [booking.hotelId._id],
      },
      isCancelled: false,
      hasNotShown: false,
      hasCheckedIn: true,
      hasCheckedOut: false,
      isRoomAssigned: true,
      checkIn: {
        $lte: curdate,
      },
      checkOut: {
        $gte: curdate,
      },
      bookingId: {
        $ne: bookingId,
      },
    }).populate("assignedRoom.rooms");

    const filledRooms = bookings
      .map((book) => book.assignedRoom!.rooms)
      .flat() as IRoom[];

    if (permission.isTimeBounded) {
      for (let i = 0; i < filledRooms.length; i++) {
        if (rooms.find((room) => room.roomNo == filledRooms[i].roomNo)) {
          return res.status(400).json({
            status: false,
            message: "One Selected Room is already filled.",
          });
        }
      }
    }

    const hotelRooms = Object.keys((booking.hotelId as IHotel).hotelStructure)
      .map((floorName) => {
        return (booking.hotelId as IHotel).hotelStructure[floorName];
      })
      .flat();

    const isRoomDataCorrect = rooms.every((room) => {
      return hotelRooms.find((hotelRoom) => {
        return (
          room.roomNo == hotelRoom.roomNo && room.roomType == hotelRoom.roomType
        );
      });
    });

    if (!isRoomDataCorrect) {
      return res
        .status(400)
        .json({ status: false, message: "Please choose correct rooms." });
    }

    let bookedRooms = Object.keys(booking.bookedRooms);

    for (let i = 0; i < bookedRooms.length; i++) {
      if (
        booking.bookedRooms[bookedRooms[i]].length !=
        rooms.filter((room) => room.roomType == bookedRooms[i]).length
      ) {
        return res
          .status(400)
          .json({ status: false, message: "Please choose correct rooms." });
      }
    }
    let assignedRooms = rooms.map((room) => {
      return hotelRooms.find((hotelRoom) => {
        return (
          hotelRoom.roomNo == room.roomNo && hotelRoom.roomType == room.roomType
        );
      })!;
    });

    if (booking.isRoomAssigned && booking.assignedRoom != undefined) {
      booking.roomShifts.push({
        from: booking.assignedRoom,
        to: {
          assignedBy: decodedData._id,
          rooms: assignedRooms,
          date: curdate.toDate(),
        },
        date: curdate.toDate()
      });
      booking.assignedRoom = {
        assignedBy: decodedData._id,
        rooms: assignedRooms,
        date: curdate.toDate(),
      };
    } else {
      booking.isRoomAssigned = true;
      booking.assignedRoom = {
        assignedBy: decodedData._id,
        rooms: assignedRooms,
        date: curdate.toDate(),
      };
    }

    await booking.save();

    return res
      .status(200)
      .json({
        status: true,
        message: "Room Assigned Succesfully",
        data: await bookingNotifierAsEvent(booking, BookingActions.RoomAssigned)
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time" });
  }
};

export default managerAssignRoom;
