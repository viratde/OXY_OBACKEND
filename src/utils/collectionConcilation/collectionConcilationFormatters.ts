import IBooking from "../../types/bookings/booking"
import bookingStatusFinder from "../common/bookingStatusFinder"
import dateFormatterForShort from "../common/dateFormatterShortBooking"
import ICollectionConcilationBooking, { ICollectionConcilationBookingPayment } from "./collectionConcilationBookingFormat"
import collectionConcilationCalculator from "./collectionConcilationCalculator"


const collectionConcilationFormatters = (
    bookings: Array<IBooking>,
    date: string
): Array<ICollectionConcilationBooking> => {

    return bookings.map((booking) => {
        let result = collectionConcilationCalculator(booking, date)

        let data: ICollectionConcilationBooking = {
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
                ADV: result.ADV as ICollectionConcilationBookingPayment[],
                REV: result.REV as ICollectionConcilationBookingPayment[],
                DUE: result.DUE as ICollectionConcilationBookingPayment[]
            }
        }
        return data
    }).filter(book => (book.data.ADV.length + book.data.REV.length + book.data.DUE.length) != 0)
}


export default collectionConcilationFormatters