import moment from "moment-timezone";
import isDateFormat from "../../validations/isDateFormat";
import Bookings from "../../models/bookings/bookingModel";
import User from "../../models/users/userModel";
import IHotel from "../../types/hotels/hotel";

const createBooking = async (
  hotel: IHotel,
  checkInDate: string,
  checkOutDate: string,
  rooms: { [key: string]: Array<number> },
  name: string,
  phoneNumber: string,
  email: string | undefined,
  isTimeBounded: boolean
) => {
  const requiredRoomTypes = Object.keys(rooms);
  const availableRoomTypes = Object.keys(hotel.roomTypes);

  if (
    !requiredRoomTypes.every((roomType) =>
      availableRoomTypes.includes(roomType)
    )
  ) {
    return {
      status: false,
      message: "Unavailable Room Types.",
    };
  }

  if (!isDateFormat(checkInDate)) {
    return {
      status: false,
      message: "Please enter correct check in Date.",
    };
  }

  if (!isDateFormat(checkOutDate)) {
    return {
      status: false,
      message: "Please enter correct check out Date.",
    };
  }

  
  let timezone = hotel.timezone;

  let curdate = moment().tz(timezone);

  let checkInTime = moment.tz(
    `${checkInDate}-${hotel.checkIn}-00`,
    "DD-MM-YYYY-HH-mm-ss",
    timezone
  );
  let canStayCheckIn = checkInTime.clone();
  const checkOutTime = moment.tz(
    `${checkOutDate}-${hotel.checkOut}-00`,
    "DD-MM-YYYY-HH-mm-ss",
    timezone
  );
  const day = Math.ceil(
    (((checkOutTime.unix() - checkInTime.unix()) / (60 * 60 * 24)))
  );
  if (!checkInTime.isValid() || !checkOutTime.isValid()) {
    return {
      status: false,
      message: "Please enter correct check In And Out Date.",
    };
  }


  if (isTimeBounded) {
    if (checkInTime.unix() < curdate.unix()) {
      checkInTime = curdate;
    }

    if (
      checkOutTime.unix() <= curdate.unix() ||
      checkOutTime.unix() <= checkInTime.unix()
    ) {
      return {
        status: false,
        message: "Please enter correct check out date.",
      };
    }
  }


  const bookedRooms = (
    await Bookings.find({
      hotelId: hotel._id,
      isCancelled: false,
      hasCheckedOut: false,
      hasNotShown: false,
      allotedRooms: {
        $elemMatch: {
          startDate: {
            $lt: checkOutTime.toDate(),
          },
          endDate: {
            $gt: checkInTime.toDate(),
          }
        },
      },
    })
  )
    .map((booking) => booking.allotedRooms)
    .flat();



  if (isTimeBounded) {
    for (let i = 0; i < requiredRoomTypes.length; i++) {
      const totalRooms = hotel.roomTypes[requiredRoomTypes[i]].availableRooms;
      const noOfBookedRooms = bookedRooms
        .filter((room) => room.roomType == requiredRoomTypes[i])
        .map((book) => book.noOfRooms)
        .reduce((acc, cur) => acc + cur, 0);
      if (rooms[requiredRoomTypes[i]].length > totalRooms - noOfBookedRooms) {
        return {
          status: false,
          message: `${requiredRoomTypes[i]} rooms not available.`,
        };
      }
    }
  }

  let user = await User.findOne({ phoneNumber: phoneNumber });
  if (!user) {
    user = new User({ phoneNumber: phoneNumber, name: name, email: email, isCreatedByManager: true });
    await user.save();
  } else if (user.name == "" || user.name != name) {
    user.name = name;
    await user.save();
  } else if ((user.email == "" || user.email != email) && email != "") {
    user.email = email;
    await user.save();
  }

  return {
    status: true,
    message: "Rooms are available",
    data: {
      checkInTime,
      checkOutTime,
      canStayCheckIn,
      user,
      day: day != 0 ? day : 1,
      timezone: hotel.timezone,
      hotelCheckInTime: hotel.checkIn,
      hotelCheckOutTime: hotel.checkOut,
      curdate: curdate.toDate(),
    },
  };
};

export default createBooking;
