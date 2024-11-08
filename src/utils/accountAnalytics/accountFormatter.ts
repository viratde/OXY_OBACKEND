import IBooking from "../../types/bookings/booking";
import bookingStatusFinder from "../common/bookingStatusFinder";
import dateFormatterForShort from "../common/dateFormatterShortBooking";
import IAccountAnalyticsBooking from "./accountAnalyticsBookingFormat";
import accountCalculators from "./accountCalculators";

const revenueFormatter = (
  bookings: Array<IBooking>,
  date: string
): Array<IAccountAnalyticsBooking> => {
  let fBook = bookings.map((booking) => {
    let data: IAccountAnalyticsBooking = {
      hotelId:booking.hotelId._id,
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
      data: accountCalculators.revenueCalculator(booking, date),
    };
    return data;
  });
  return fBook;
};

const collectionFormatter = (
  bookings: Array<IBooking>,
  date: string
): Array<IAccountAnalyticsBooking> => {
  let fBook = bookings.map((booking) => {
    let data: IAccountAnalyticsBooking = {
      hotelId:booking.hotelId._id,
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
      data: accountCalculators.collectionCalculator(booking, date),
    };
    return data;
  });
  return fBook;
};

const salesFormatter = (
  bookings: Array<IBooking>,
  date: string
): Array<IAccountAnalyticsBooking> => {
  let fBook = bookings.map((booking) => {
    let data: IAccountAnalyticsBooking = {
      hotelId:booking.hotelId._id,
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
      data: accountCalculators.salesCalculators(booking, date),
    };
    return data;
  });
  return fBook;
};

const accountFormatters = {
  revenueFormatter,
  collectionFormatter,
  salesFormatter
};

export default accountFormatters;
