import moment from "moment-timezone";
import IBooking from "../../types/bookings/booking"
import ICollectionConcilationBooking from "./collectionConcilationBookingFormat";
import collectionConcilationFormatters from "./collectionConcilationFormatters";

const collectionConcilationHotelWrapper = async (
    allDays: Array<string>,
    collectionBookings: Array<IBooking>,
) => {

    let datas: { [key: string]: Array<ICollectionConcilationBooking> } = {};

    for (let i = 0; i < allDays.length; i++) {
        let cDate = moment(allDays[i], "DD-MM-YYYY").format("DD-MMM");
        const startDay = allDays[i];
        const endDay = moment(allDays[i], "DD-MM-YYYY")
            .add(1, "day")
            .format("DD-MM-YYYY");

        let bookings = collectionBookings.filter((booking) => {
            const endTime = moment.tz(`${endDay}-00-00`,"DD-MM-YYYY-HH-mm",booking.timezone).toDate()
            const startTime = moment.tz(`${startDay}-00-00`,"DD-MM-YYYY-HH-mm",booking.timezone).toDate()
            return booking.collections.find(collection => (collection.date >= startTime && collection.date < endTime))
        });
        

        datas[cDate] = collectionConcilationFormatters(
            bookings,
            allDays[i]
        )
    }

    return datas
}


export default collectionConcilationHotelWrapper