import moment from "moment-timezone";
import { Types } from "mongoose"
import Hotel from "../../models/hotels/hotelModel";
import revenueReconcilationBookingsFinder from "./revenueReconcilationBookingsFinder";
import Bookings, { CompletedBookings } from "../../models/bookings/bookingModel";
import IRevenueReconcilationBooking from "./revenueReconcilationBookingFormat";
import revenueReconcilationHotelWrapper from "./revnueReconcilationHotelWrapper";


const revenueReconcilationWrapper = async (
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

    const revenueBookings = revenueReconcilationBookingsFinder(
        Bookings,
        startDay,
        endDay,
        hotelIds
    )
    const revenueCBookings = revenueReconcilationBookingsFinder(
        CompletedBookings,
        startDay,
        endDay,
        hotelIds
    )

    const allData = await Promise.all([revenueBookings, revenueCBookings])

    const datas: { [key: string]: { [key: string]: Array<IRevenueReconcilationBooking> } } = {}

    for (let i = 0; i < hotels.length; i++) {
        datas[hotels[i].hotelName] = await revenueReconcilationHotelWrapper(
            allDays,
            [...allData[0], ...allData[1]].filter(booking => {
                return booking.hotelId.toString() == hotels[i]._id.toString()
            })
        )
    }

    return datas
}

export default revenueReconcilationWrapper