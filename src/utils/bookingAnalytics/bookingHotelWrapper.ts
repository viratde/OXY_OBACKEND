import IBooking from "../../types/bookings/booking";
import moment from "moment-timezone";
import IBookingAnalyticsBookingFormat from "./bookingAnalyticsBookingFormat";
import bookingAnalyticsBookingFormatter from "./bookingAnalyticsBookingFormatter";

const bookingHotelWrapper = async (
  allDays: Array<string>,
  aBookings: Array<IBooking>,
  checkedInBookings: Array<IBooking>,
  checkedOutBookings: Array<IBooking>,
  isTable: boolean
): Promise<{
  [key: string]: {
    [key: string]: { [key: string]: (Array<IBookingAnalyticsBookingFormat> | number) };
  };
}> => {
  let datas: {
    [key: string]: {
      [key: string]: { [key: string]: (Array<IBookingAnalyticsBookingFormat> | number) };
    };
  } = {};

  for (let i = 0; i < allDays.length; i++) {
    let cDate = moment(allDays[i], "DD-MM-YYYY").format("DD-MMM");

    const startDay = allDays[i];
    const endDay = moment(allDays[i], "DD-MM-YYYY")
      .add(1, "day")
      .format("DD-MM-YYYY");

    let bookings = aBookings.filter((booking) => {
      const checkInEndTime = moment
        .tz(
          `${endDay}-${booking.hotelCheckInTime}`,
          "DD-MM-YYYY-HH-mm",
          booking.timezone
        )
        .toDate();
      const checkOutStartTime = moment
        .tz(
          `${startDay}-${booking.hotelCheckOutTime}`,
          "DD-MM-YYYY-HH-mm",
          booking.timezone
        )
        .toDate();
      return (
        booking.checkIn < checkInEndTime && booking.checkOut > checkOutStartTime
      );
    });

    const WS = bookingAnalyticsBookingFormatter(
      bookings.filter((booking) => {
        return booking.isCreatedByManager && !booking.referenceId && !booking.isConveniencePayment;
      }),
      isTable
    );

    const XS = bookingAnalyticsBookingFormatter(
      bookings.filter((booking) => {
        return !booking.isCreatedByManager && !booking.referenceId && !booking.isConveniencePayment;
      }),
      isTable
    );

    const OS = bookingAnalyticsBookingFormatter(
      bookings.filter((booking) => {
        return booking.isCreatedByManager && (booking.referenceId || booking.isConveniencePayment);
      }),
      isTable
    );

    bookings = checkedInBookings.filter((booking) => {
      const endTime = moment
        .tz(
          `${endDay}-${booking.hotelCheckOutTime}`,
          "DD-MM-YYYY-HH-mm",
          booking.timezone
        )
        .toDate();
      const startTime = moment
        .tz(
          `${startDay}-${booking.hotelCheckInTime}`,
          "DD-MM-YYYY-HH-mm",
          booking.timezone
        )
        .toDate();
      return (
        booking.checkInTime &&
        booking.checkInTime >= startTime &&
        booking.checkInTime < endTime
      );
    });

    const QCI = bookingAnalyticsBookingFormatter(
      bookings.filter((book) => book.checkedInData?.isQr),
      isTable
    );
    const CCI = bookingAnalyticsBookingFormatter(
      bookings.filter((book) => !book.checkedInData?.isQr),
      isTable
    );

    bookings = checkedOutBookings.filter((booking) => {
      const endTime = moment
        .tz(
          `${endDay}-${booking.hotelCheckOutTime}`,
          "DD-MM-YYYY-HH-mm",
          booking.timezone
        )
        .toDate();
      const startTime = moment
        .tz(
          `${startDay}-${booking.hotelCheckOutTime}`,
          "DD-MM-YYYY-HH-mm",
          booking.timezone
        )
        .toDate();
      return booking.checkOut >= startTime && booking.checkOut < endTime;
    });

    const QCO = bookingAnalyticsBookingFormatter(
      bookings.filter((book) => book.checkedOutData?.isQr),
      isTable
    );
    const CCO = bookingAnalyticsBookingFormatter(
      bookings.filter((book) => !book.checkedOutData?.isQr),
      isTable
    );

    datas[cDate] = {
      TS: {
        XS,
        WS,
        OS,
      },
      TCI: {
        QCI,
        CCI,
      },
      TCO: {
        QCO,
        CCO,
      },
    };
  }
  return datas;
};

export default bookingHotelWrapper;
