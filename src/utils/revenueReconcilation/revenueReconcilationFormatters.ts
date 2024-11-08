import IBooking from "../../types/bookings/booking"
import IRoom from "../../types/hotels/room"
import bookingStatusFinder from "../common/bookingStatusFinder"
import dateFormatterForShort from "../common/dateFormatterShortBooking"
import IRevenueReconcilationBooking, { IRevenueReconcilationBookingPayment } from "./revenueReconcilationBookingFormat"
import revenueReconcilationCalculator from "./revenueReconcilationCalculator"

const revenueReconcilationFormatters = (
    bookings: Array<IBooking>,
    date: string
): Array<IRevenueReconcilationBooking> => {

    return bookings.map((booking) => {

        let result = revenueReconcilationCalculator(booking, date)
        let data: IRevenueReconcilationBooking = {
            hotelId: booking.hotelId._id,
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
            data: {
                ADV: result.ADV as IRevenueReconcilationBookingPayment[],
                REV: result.REV as IRevenueReconcilationBookingPayment[],
                DUE: result.DUE as IRevenueReconcilationBookingPayment[]
            },
            REV: {
                ...(result.Revenue as {[key:string]:number})
            },
            PEND:result.PEND,
            roomStayed:booking.assignedRoom ? booking.assignedRoom.rooms.map(room => (room as IRoom).roomNo) : []
        }
        return data
    })
}


export default revenueReconcilationFormatters