import managerGetUpcomingBookings from "./managerGetUpcomingBookings"
import managerGetIHouseBookings from "./managergetIHouseBookingsController"
import managerGetCompleteBookings from "./managerGetCompleteBookingsController"
import managerGetActionNeededBookings from "./managerGetActionNeededBookings"
import managerGetPendingPaymentBookings from "./managerGetPendingBookings"

const managerBookingController = {
    managerGetUpcomingBookings,
    managerGetIHouseBookings,
    managerGetCompleteBookings,
    managerGetActionNeededBookings,
    managerGetPendingPaymentBookings
}

export default managerBookingController