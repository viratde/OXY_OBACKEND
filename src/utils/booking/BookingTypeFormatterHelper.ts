import moment from "moment-timezone"
import IBooking from "../../types/bookings/booking"

export enum BookingDataTypes {

    UpcomingToday = "UpcomingToday",
    UpcomingYesterday = "UpcomingYesterday",
    UpcomingTomorrow = "UpcomingTomorrow",
    UpcomingLater = "UpcomingLater",

    DepartingToday = "DepartingToday",
    DepartingTomorrow = "DepartingTomorrow",
    DepartingLater = "DepartingLater",

    EarlyCheckOut = "EarlyCheckOut",
    SameDayCheckOut = "SameDayCheckOut",
    CheckedOut = "CheckedOut",
    NotCheckedOut = "NotCheckedOut",
    NotCheckedIn = "NotCheckedIn",
    Cancelled = "Cancelled",
    NotShown = "NotShown",

    NoShowNeeded = "NoShowNeeded",
    CheckedOutNeeded = "CheckedOutNeeded",

    Pending = "Pending"
}


enum BookingTypeFormatterHelper {

    Upcoming = "Upcoming",
    InHouse = "InHouse",
    Completed = "Completed",
    ActionNeeded = "ActionNeeded",
    Pending = "Pending"

}

export const findBookingStatus = (
    booking: IBooking,
    wtype: BookingTypeFormatterHelper | undefined
) => {

    const todayCheckInDate = moment.tz(
        `${moment(new Date()).format("DD-MM-YYYY")}-12-00-00`,
        "DD-MM-YYYY-HH-mm-ss",
        "Asia/Kolkata"
    )

    let type = wtype


    const todayCheckOutDate = todayCheckInDate.clone().add(23, "hours")

    const oneDayDiff = 24 * 60 * 60

    if (!wtype) {
        if (booking.isCancelled || booking.hasNotShown) {
            type = BookingTypeFormatterHelper.Completed
        } else if (
            booking.hasCheckedOut ||
            (booking.hasCheckedIn
                &&
                booking.actualCheckOut.getMilliseconds() > todayCheckOutDate.milliseconds()
            )

        ) {
            type = BookingTypeFormatterHelper.Completed
        } else if (booking.hasCheckedIn) {
            type = BookingTypeFormatterHelper.InHouse
        } else if (booking.actualCheckIn.getMilliseconds() > todayCheckOutDate.millisecond()) {
            type = BookingTypeFormatterHelper.Completed
        } else {
            type = BookingTypeFormatterHelper.Upcoming
        }

    }

    let checkInDate = moment(booking.actualCheckIn)
    let checkOutDate = moment(booking.actualCheckOut)

    if (type == BookingTypeFormatterHelper.Upcoming) {

        let diff = checkInDate.clone().unix() - todayCheckInDate.unix()

        if (diff < 0 && checkInDate.format("DD-MM-YYYY") != todayCheckInDate.format("DD-MM-YYYY")) {
            return BookingDataTypes.UpcomingYesterday
        } else if (diff < oneDayDiff) {
            return BookingDataTypes.UpcomingToday
        } else if (diff < oneDayDiff * 2) {
            return BookingDataTypes.UpcomingTomorrow
        } else {
            return BookingDataTypes.UpcomingLater
        }
    } else if (type == BookingTypeFormatterHelper.InHouse) {

        let diff = checkOutDate.clone().unix() - todayCheckOutDate.unix()

        if (diff == 0) {
            return BookingDataTypes.DepartingToday
        } else if (diff < oneDayDiff) {
            return BookingDataTypes.DepartingTomorrow
        } else {
            return BookingDataTypes.DepartingLater
        }
    } else if (type == BookingTypeFormatterHelper.Completed) {

        if (booking.hasCheckedOut) {

            let dTime = moment(booking.checkOutTime)
            let aTime = moment(booking.actualCheckOut)

            if (dTime.unix() < aTime.unix() && dTime.format("DD-MM-YYYY") != aTime.format("DD-MM-YYYY")) {
                return BookingDataTypes.SameDayCheckOut
            } else if (dTime.unix() < aTime.unix() && dTime.format("DD-MM-YYYY") == aTime.format("DD-MM-YYYY")) {
                return BookingDataTypes.EarlyCheckOut
            } else {
                return BookingDataTypes.CheckedOut
            }

        } else if (booking.isCancelled) {
            return BookingDataTypes.Cancelled
        } else if (booking.hasNotShown) {
            return BookingDataTypes.NotShown
        } else if (booking.hasCheckedIn && !booking.hasCheckedOut) {
            return BookingDataTypes.NotCheckedOut
        } else if (!booking.hasCheckedIn && !booking.hasCheckedOut) {
            return BookingDataTypes.NotCheckedIn
        }
    } else if (type == BookingTypeFormatterHelper.ActionNeeded) {
        if (!booking.hasCheckedOut && booking.hasCheckedIn) {
            return BookingDataTypes.CheckedOutNeeded
        } else if (!booking.hasCheckedOut && booking.hasCheckedIn) {
            return BookingDataTypes.NoShowNeeded
        }
    } else if (type == BookingTypeFormatterHelper.Pending) {
        return BookingDataTypes.Pending
    }

    return BookingDataTypes.Cancelled
}



export default BookingTypeFormatterHelper