import moment from "moment-timezone";
import IBooking from "../../types/bookings/booking";
import { IRevenueReconcilationBookingPayment } from "./revenueReconcilationBookingFormat";
import { Types } from "mongoose";
import IManager from "../../types/managers/manager";
import findAccountingDates from "../accounts/findDate";

const revenueReconcilationCalculator = (
    booking: IBooking,
    date: string
) => {

    let collections: IRevCollection[] = [...booking.collections].map(paym => {
        return {
            ...paym,
            availableAmount: paym.total,
            date: moment.tz(paym.date, booking.timezone),
            transaction: paym.transaction ? {
                paymentMode: paym.transaction.paymentMode
            } : undefined
        }
    })

    let colStartDate = moment.tz(`${date}-00-00-00`, "DD-MM-YYYY-HH-mm-ss", booking.timezone).unix()
    let colEndDate = moment.tz(`${date}-00-00-00`, "DD-MM-YYYY-HH-mm-ss", booking.timezone).clone().add(1, "day").unix()

    const noOfDates = Math.ceil(
        (moment(booking.checkOut).unix() - moment(booking.checkIn).unix()) /
        (24 * 60 * 60)
    );

    let pDates = [...((findAccountingDates(booking.checkIn, booking.checkOut))
        .filter(dat => {
            return dat.getTime() < colStartDate * 1000
        }).map((dat) => moment.tz(dat, booking.timezone).format("DD-MM-YYYY")))]

    const bookingRevenue = booking.bookingAmount / noOfDates;
    const extraChargesReveue = booking.extraCharges
        .filter((extraCharge) => {
            return (
                moment.tz(extraCharge.revenueDate, booking.timezone).format("DD-MM-YYYY") ==
                date
            );
        })
        .reduce((acc, cur) => acc + cur.revenueAmount, 0);

    const prevoiusExtraChargesRevenue = booking.extraCharges
        .filter((extraCharge) => {
            let date = moment.tz(extraCharge.revenueDate, booking.timezone).format("DD-MM-YYYY")
            return pDates.includes(date)
        })
        .reduce((acc, cur) => acc + cur.revenueAmount, 0)

    let pAmount = pDates.length >= 1 ? (bookingRevenue + (booking.convenienceAmount ? (booking.convenienceAmount / noOfDates) : 0) + prevoiusExtraChargesRevenue) : 0
    let REQ = bookingRevenue + extraChargesReveue + (booking.convenienceAmount ? (booking.convenienceAmount / noOfDates) : 0)
    let Gathered = 0

    if (pAmount > 0) {
        let cols: IRevCollection[] = []
        let gath = 0
        for (let i = 0; i < collections.length; i++) {
            if (pAmount != gath) {
                let req = pAmount - gath
                if (collections[i].total <= req) {
                    gath = gath + collections[i].total
                } else {
                    gath = gath + req
                    cols.push({
                        ...(collections[i]),
                        availableAmount: collections[i].total - req
                    })
                }
            } else {
                cols.push(collections[i])
            }
        }
        collections = cols
    }

    let ADV: Array<IRevenueReconcilationBookingPayment> = []
    let REV: Array<IRevenueReconcilationBookingPayment> = []
    let DUE: Array<IRevenueReconcilationBookingPayment> = []


    let ADVCols = collections.filter(col => {
        return col.date.unix() < colStartDate
    })

    let res = ColsToPayment(ADVCols, REQ - Gathered)
    ADV = res.data
    Gathered += res.gatheredAmount

    let REVCols = collections.filter(col => {
        return (col.date.unix() >= colStartDate && col.date.unix() < colEndDate)
    })

    res = ColsToPayment(REVCols, REQ - Gathered)
    REV = res.data
    Gathered += res.gatheredAmount

    let PENDCols = collections.filter(col => {
        return col.date.unix() >= colEndDate
    })

    res = ColsToPayment(PENDCols, REQ - Gathered)
    DUE = res.data
    Gathered += res.gatheredAmount

    let Revenue = {
        XBR: (booking.referenceId || booking.isConveniencePayment) ? 0 : bookingRevenue,
        XECR: (booking.referenceId || booking.isConveniencePayment) ? 0 : extraChargesReveue,
        OBR: (!booking.referenceId && !booking.isConveniencePayment) ? 0 : bookingRevenue,
        OECR: (!booking.referenceId && !booking.isConveniencePayment) ? 0 : extraChargesReveue,
        CFEE: (booking.convenienceAmount ? booking.convenienceAmount : 0) / noOfDates
    };

    return { ADV, REV, DUE, Revenue, PEND: (REQ - Gathered) }
}

const ColsToPayment = (
    cols: Array<IRevCollection>,
    requiredValue: number
): {
    data: IRevenueReconcilationBookingPayment[];
    gatheredAmount: number;
} => {
    let data: IRevenueReconcilationBookingPayment[] = []
    let gatheredAmount = 0
    for (let i = 0; i < cols.length; i++) {
        if (gatheredAmount >= requiredValue) {
            break
        }
        let col = cols[i]
        let method: string = ((col.bank != 0) ? "bank" : ((col.cash != 0 ? "cash" : ((col.ota != 0) ? "ota" : (col.transaction ? col.transaction.paymentMode : "unknown")))))
        let methodValue = col.availableAmount
        let gath = methodValue > (requiredValue - gatheredAmount) ? (requiredValue - gatheredAmount) : methodValue
        data.push(
            {
                method,
                date: col.date.format("DD-MMM"),
                effectiveValue: gath,
                actualValue: col.total,
                transId: null
            }
        )
        gatheredAmount += gath
    }
    return { data, gatheredAmount }
}

interface IRevCollection {
    availableAmount: number;
    date: moment.Moment;
    cash: number;
    bank: number;
    ota: number;
    total: number;
    by: Types.ObjectId | IManager;
    transaction?: {
        paymentMode: string
    }
}


export default revenueReconcilationCalculator