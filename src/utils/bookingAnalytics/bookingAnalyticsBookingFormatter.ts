import IBooking from "../../types/bookings/booking";
import bookingStatusFinder from "../common/bookingStatusFinder";
import dateFormatterForShort from "../common/dateFormatterShortBooking";
import IBookingAnalyticsBookingFormat from "./bookingAnalyticsBookingFormat";

const bookingAnalyticsBookingFormatter = (
  bookings: Array<IBooking>,
  isTable: boolean
): Array<IBookingAnalyticsBookingFormat> | number => {
  let fBook = bookings.map((booking) => {
    let data: IBookingAnalyticsBookingFormat = {
      bookingId: booking.bookingId,
      rooms: Object.keys(booking.bookedRooms)
        .map((roomType) => booking.bookedRooms[roomType])
        .flat()
        .length,
      name: booking.name,
      phoneNumber: booking.phoneNumber,
      stay: dateFormatterForShort(booking),
      amount: booking.amount,
      status: bookingStatusFinder(booking),
    };
    return data;
  });
  return isTable ? (fBook.reduce((acc, cur) => { return acc + cur.rooms }, 0)) : fBook;
};

export default bookingAnalyticsBookingFormatter