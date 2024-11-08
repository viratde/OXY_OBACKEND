import moment from "moment-timezone";
import IBooking from "../../types/bookings/booking"
import IRevenueReconcilationBooking from "./revenueReconcilationBookingFormat";
import revenueReconcilationFormatters from "./revenueReconcilationFormatters";

const revenueReconcilationHotelWrapper = async (
    allDays: Array<string>,
    revenueBookings: Array<IBooking>,
) => {

    let datas: { [key: string]: Array<IRevenueReconcilationBooking> } = {};

    for (let i = 0; i < allDays.length; i++) {
        let cDate = moment(allDays[i], "DD-MM-YYYY").format("DD-MMM");
        const startDay = allDays[i];
        const endDay = moment(allDays[i], "DD-MM-YYYY")
            .add(1, "day")
            .format("DD-MM-YYYY");

        let bookings = revenueBookings.filter((booking) => {
            const checkInEndTime = moment.tz(`${endDay}-${booking.hotelCheckInTime}`, "DD-MM-YYYY-HH-mm", booking.timezone).toDate()
            const checkOutStartTime = moment.tz(`${startDay}-${booking.hotelCheckOutTime}`, "DD-MM-YYYY-HH-mm", booking.timezone).toDate()
            return booking.checkIn < checkInEndTime && booking.checkOut > checkOutStartTime
        });

        datas[cDate] = revenueReconcilationFormatters(
            bookings,
            allDays[i]
        )
    }

    return datas
}


export default revenueReconcilationHotelWrapper