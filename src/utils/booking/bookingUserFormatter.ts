import IBooking from "../../types/bookings/booking";
import moment from "moment";

const bookingUserFormatter = (booking:IBooking) => {
    return {
        _id: booking._id,
        hotelId: booking.hotelId._id,
        amount: booking.amount,
        bookingAmount: booking.bookingAmount,
        checkIn: moment(booking.checkIn).format("DD-MM-YYYY"),
        checkOut: moment(booking.checkOut).format("DD-MM-YYYY"),
        isCancelled: booking.isCancelled,
        hasCheckedIn: booking.hasCheckedIn,
        hasCheckedOut: booking.hasCheckedOut,
        bookingId: booking.bookingId,
        hasNotShown: booking.hasNotShown,
        bookedRooms: booking.bookedRooms
    }
}

export default bookingUserFormatter