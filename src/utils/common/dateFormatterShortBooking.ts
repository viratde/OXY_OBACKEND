import moment from "moment-timezone"
import IBooking from "../../types/bookings/booking"

const dateFormatterForShort = (booking:IBooking) => {
    let checkIn = moment.tz(booking.checkIn,booking.timezone).format("DD MMM YYYY")
    let checkOut = moment.tz(booking.checkOut,booking.timezone).format("DD MMM YYYY")

    if (checkIn.slice(2) == checkOut.slice(2)) {
        return `${checkIn.slice(0, 2)} - ${checkOut.slice(0, 6)}`
    } else if (checkIn.slice(6) == checkOut.slice(6)) {
        return `${checkIn.slice(0, 6)} - ${checkOut.slice(0, 6)}`
    } else {
        return `${checkIn} - ${checkOut}`
    }
}

export default dateFormatterForShort