import IBooking from "../../types/bookings/booking";
import moment from "moment-timezone";
import accountFormatters from "./accountFormatter";
import IAccountAnalyticsBooking from "./accountAnalyticsBookingFormat";

const accountHotelWrapper = async (
  allDays: Array<string>,
  revenueBookings: Array<IBooking>,
  collectionBookings: Array<IBooking>,
  salesBookings: Array<IBooking>
): Promise<{ [key: string]: { [key: string]: Array<IAccountAnalyticsBooking>} }> => {
  let datas: { [key: string]: { [key: string]: Array<IAccountAnalyticsBooking>} } =
    {};

  for (let i = 0; i < allDays.length; i++) {
    let cDate = moment(allDays[i], "DD-MM-YYYY").format("DD-MMM");

    const startDay = allDays[i];
    const endDay = moment(allDays[i], "DD-MM-YYYY")
      .add(1, "day")
      .format("DD-MM-YYYY");

      let bookings = revenueBookings.filter((booking) => {
        const checkInEndTime = moment.tz(`${endDay}-${booking.hotelCheckInTime}`,"DD-MM-YYYY-HH-mm",booking.timezone).toDate()
        const checkOutStartTime = moment.tz(`${startDay}-${booking.hotelCheckOutTime}`,"DD-MM-YYYY-HH-mm",booking.timezone).toDate()
      return booking.checkIn < checkInEndTime && booking.checkOut > checkOutStartTime
    });

    let revenues = accountFormatters.revenueFormatter(
        bookings,
        allDays[i]
    )

    bookings = collectionBookings.filter(booking => {
        const endTime = moment.tz(`${endDay}-00-00`,"DD-MM-YYYY-HH-mm",booking.timezone).toDate()
        const startTime = moment.tz(`${startDay}-00-00`,"DD-MM-YYYY-HH-mm",booking.timezone).toDate()
        return booking.collections.find(collection => (collection.date >= startTime && collection.date < endTime))
    })

    let collections = accountFormatters.collectionFormatter(
        bookings,
        allDays[i]
    )

    bookings = salesBookings.filter(booking => {
        const endTime = moment.tz(`${endDay}-00-00`,"DD-MM-YYYY-HH-mm",booking.timezone).toDate()
        const startTime = moment.tz(`${startDay}-00-00`,"DD-MM-YYYY-HH-mm",booking.timezone).toDate()
        return (booking.createdAt >= startTime && booking.createdAt < endTime) || booking.extraCharges.find(extraCharge => {
            return extraCharge.date >= startTime && extraCharge.date < endTime
        })
    })

    let sales = accountFormatters.salesFormatter(
        bookings,
        allDays[i]
    )

    datas[cDate] = {
        REV:revenues,
        COLS:collections,
        SAL:sales
    }
  }

  return datas;
};

export default accountHotelWrapper;
