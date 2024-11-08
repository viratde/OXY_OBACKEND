import moment from "moment-timezone";
import IBooking from "../../types/bookings/booking";
import { Types } from "mongoose";
import IManager from "../../types/managers/manager";
import { ICollectionConcilationBookingPayment } from "./collectionConcilationBookingFormat";
import findAccountingDates from "../accounts/findDate";


const collectionConcilationCalculator = (
    booking: IBooking,
    date: string
) => {

    let tDate = moment.tz(date, "DD-MM-YYYY", booking.timezone).format("DD-MMM")
    let collections: IRevCollection[] = [...booking.collections].map(paym => {
        return {
            ...paym,
            availableAmount: paym.total,
            date: moment.tz(paym.date, booking.timezone)
        }
    }).sort((a, b) => {
        return a.date.unix() - b.date.unix()
    })

    const noOfDates = Math.ceil(
        (moment(booking.checkOut).unix() - moment(booking.checkIn).unix()) /
        (24 * 60 * 60)
    );

    const bookingRevenue = (booking.bookingAmount / noOfDates) + (booking.convenienceAmount ? (booking.convenienceAmount / noOfDates) : 0);

    const aDates = findAccountingDates(booking.checkIn, booking.checkOut)

    const aRevenues = aDates.map(date => {
        return bookingRevenue + booking.extraCharges
            .filter((extraCharge) => {
                return (
                    moment.tz(extraCharge.date, booking.timezone).format("DD-MM-YYYY") ==
                    moment.tz(date, booking.timezone).format("DD-MM-YYYY")
                );
            })
            .reduce((acc, cur) => acc + cur.revenueAmount, 0);
    })

    let newCols = [...collections]
    let ADV: Array<ICollectionConcilationBookingPayment> = []
    let REV: Array<ICollectionConcilationBookingPayment> = []
    let DUE: Array<ICollectionConcilationBookingPayment> = []

    for (let i = 0; i < aDates.length; i++) {
        let REQ = aRevenues[i]
        let GATH = 0

        while (REQ != GATH && newCols.length > 0) {
            let curREQ = REQ - GATH
            let col = newCols[0]
            let method = ((col.bank != 0) ? "bank" : ((col.cash != 0 ? "cash" : ((col.ota != 0) ? "ota" : "unknown"))))
            let methodValue = col.availableAmount
            let effectiveValue = methodValue
            if (methodValue <= curREQ) {
                GATH = GATH + effectiveValue
                newCols.splice(0, 1)
            } else {
                GATH = GATH + curREQ
                effectiveValue = curREQ
                newCols[0] = {
                    ...(newCols[0]),
                    availableAmount: (newCols[0].availableAmount - curREQ)
                }
            }

            let isSameDate = col.date.format("DD-MM-YYYY") == moment.tz(aDates[i],booking.timezone).format("DD-MM-YYYY")
            let isColDate = tDate === col.date.format("DD-MMM")
            if (isSameDate && isColDate) {
                REV.push({
                    date: moment.tz(aDates[i], booking.timezone).format("DD-MMM"),
                    effectiveValue: effectiveValue,
                    actualValue: col.total,
                    method: method,
                    transId: null
                })
            } else if (!isSameDate && (col.date.unix() < moment(aDates[i]).unix()) && isColDate) {
                ADV.push({
                    date: moment.tz(aDates[i], booking.timezone).format("DD-MMM"),
                    effectiveValue: effectiveValue,
                    actualValue: col.total,
                    method: method,
                    transId: null
                })
            } else if (isColDate) {
                DUE.push({
                    date: moment.tz(aDates[i], booking.timezone).format("DD-MMM"),
                    effectiveValue: effectiveValue,
                    actualValue: col.total,
                    method: method,
                    transId: null
                })
            }
        }

    }
    return { ADV, REV, DUE }
}

interface IRevCollection {
    availableAmount: number;
    date: moment.Moment;
    cash: number;
    bank: number;
    ota: number;
    total: number;
    by: Types.ObjectId | IManager;
}


export default collectionConcilationCalculator