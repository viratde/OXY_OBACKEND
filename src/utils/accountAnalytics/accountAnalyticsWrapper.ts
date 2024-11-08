import { Types } from "mongoose";
import Hotel from "../../models/hotels/hotelModel";
import moment from "moment-timezone";
import Bookings, { CompletedBookings } from "../../models/bookings/bookingModel";
import accountCollectionFinder from "./accountCollectionFinder";
import accountSalesFinder from "./accountSalesFinder";
import accountRevenueFinder from "./accountRevenueFinder";
import IBooking from "../../types/bookings/booking";
import IAccountAnalyticsBooking from "./accountAnalyticsBookingFormat";
import accountHotelWrapper from "./accountHotelWrapper";

const accountAnalyticsWrapper = async (
  startDay: string,
  days: number,
  hotelIds: Array<Types.ObjectId>,
  isTable: boolean
) => {
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

    const revenueBookings = accountRevenueFinder(
      Bookings,
      startDay,
      endDay,
      hotelIds
    )
    const revenueCBookings = accountRevenueFinder(
      CompletedBookings,
      startDay,
      endDay,
      hotelIds
    )

    const collectionBookings = accountCollectionFinder(
      Bookings,
      startDay,
      endDay,
      hotelIds
    )

    const collectionCBookings = accountCollectionFinder(
      CompletedBookings,
      startDay,
      endDay,
      hotelIds
    )

    const salesBookings = accountSalesFinder(
      Bookings,
      startDay,
      endDay,
      hotelIds
    )

    const salesCBookings = accountSalesFinder(
      CompletedBookings,
      startDay,
      endDay,
      hotelIds
    )

    const allData = await Promise.all([revenueBookings,revenueCBookings,collectionBookings,collectionCBookings,salesBookings,salesCBookings])

    const datas: { [key: string]: { [key: string]: {[key:string]:Array<IAccountAnalyticsBooking>} }  } = {};

    for (let i = 0; i < hotels.length; i++) {
      datas[hotels[i].hotelName] = await accountHotelWrapper(
          allDays,
          [...allData[0],...allData[1]].filter(booking => {
              return booking.hotelId.toString() == hotels[i]._id.toString()
          }),
          [...allData[2],...allData[3]].filter(booking => {
              return booking.hotelId.toString() == hotels[i]._id.toString()
          }),
          [...allData[4],...allData[5]].filter(booking => {
              return booking.hotelId.toString() == hotels[i]._id.toString()
          })
      )
  }
  
    return datas
};

export default accountAnalyticsWrapper;
