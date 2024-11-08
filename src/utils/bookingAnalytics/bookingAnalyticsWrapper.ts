import moment from "moment-timezone";
import Hotel from "../../models/hotels/hotelModel";
import Bookings, {
  CompletedBookings,
} from "../../models/bookings/bookingModel";
import { Types } from "mongoose";
import bookingSalesFinder from "./bookingSalesFinder";
import bookingCheckInsFinder from "./bookingCheckInsFinder";
import bookingCheckOutFinder from "./bookingCheckOutFinder";
import bookingHotelWrapper from "./bookingHotelWrapper";
import IBooking from "../../types/bookings/booking";
import IBookingAnalyticsBookingFormat from "./bookingAnalyticsBookingFormat";

const bookingAnalyticsWrapper = async (
  startDay: string,
  days: number,
  hotelIds: Array<Types.ObjectId>,
  isTable: boolean
): Promise<{
  [key: string]: {
    [key: string]: { [key: string]: { [key: string]: (Array<IBookingAnalyticsBookingFormat> | number) } };
  };
}> => {
  let startDate = moment.tz(
    `${startDay} 00:00:00`,
    "DD-MM-YYYY HH:mm:ss",
    "UTC"
  );

  let allDays = [startDate.format("DD-MM-YYYY")];

  const hotels = await Hotel.find({
    _id: {
      $in: hotelIds,
    },
  });

  for (let i = 1; i < days; i++) {
    allDays.push(startDate.clone().add(i, "day").format("DD-MM-YYYY"));
  }

  let endDay = moment(startDay, "DD-MM-YYYY")
    .add(days, "day")
    .format("DD-MM-YYYY");

  const saleBookings = bookingSalesFinder(Bookings, startDay, endDay, hotelIds);

  const saleCBookings = bookingSalesFinder(
    CompletedBookings,
    startDay,
    endDay,
    hotelIds
  );

  const checkedInBookings = bookingCheckInsFinder(
    Bookings,
    startDay,
    endDay,
    hotelIds
  );

  const checkedInCBookings = bookingCheckInsFinder(
    CompletedBookings,
    startDay,
    endDay,
    hotelIds
  );

  const checkedOutBookings = bookingCheckOutFinder(
    CompletedBookings,
    startDay,
    endDay,
    hotelIds
  );

  const allDatas = await Promise.all([
    saleBookings,
    saleCBookings,
    checkedInBookings,
    checkedInCBookings,
    checkedOutBookings,
  ]);

  const datas: {
    [key: string]: {
      [key: string]: { [key: string]: { [key: string]: (Array<IBookingAnalyticsBookingFormat> | number) } };
    };
  } = {};

  for (let i = 0; i < hotels.length; i++) {
    datas[hotels[i].hotelName] = await bookingHotelWrapper(
      allDays,
      [...allDatas[0], ...allDatas[1]].filter((booking) => {
        return booking.hotelId.toString() == hotels[i]._id.toString();
      }),
      [...allDatas[2], ...allDatas[3]].filter((booking) => {
        return booking.hotelId.toString() == hotels[i]._id.toString();
      }),
      allDatas[4].filter((booking) => {
        return booking.hotelId.toString() == hotels[i]._id.toString();
      }),
      isTable
    );
  }

  return datas;
};
export default bookingAnalyticsWrapper;
