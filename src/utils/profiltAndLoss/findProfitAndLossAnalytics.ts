import { Types } from "mongoose"
import getBookingRevenueAnalytics from "../accountAnalytics/getBookingRevenueAnalytics"
import findExpenseAnalytics from "../expense/analytics/findExpenseAnalytics"
import IExpenseAnalytics from "../expense/analytics/IExpenseAnalytics"
import IAccountAnalyticsBooking from "../accountAnalytics/accountAnalyticsBookingFormat"


const findProfitAndLossAnalytics = async (
    startDay: string,
    days: number,
    isTable: boolean,
    hotelIds: Array<Types.ObjectId>
) => {

    const data = await Promise.all([
        findExpenseAnalytics(
            startDay,
            days,
            isTable,
            hotelIds
        ),
        getBookingRevenueAnalytics(
            startDay,
            days,
            isTable,
            hotelIds
        )
    ])

    const expense = data[0]
    const revenue = data[1]

    let Profit: {
        [key: string]: {
            [key: string]: number
        }
    } = {}

    const allHotels = Object.keys(expense)
    const allDates = allHotels.length > 0 ? Object.keys(expense[allHotels[0]]) : []

    for (let i = 0; i < allHotels.length; i++) {
        let aData: {
            [key: string]: number
        } = {}
        for (let j = 0; j < allDates.length; j++) {
            const Revenue: number = revenue[allHotels[i]][allDates[j]].reduce((acc, cur) => {
                return acc + cur.XBR + cur.CFEE + cur.OBR
            }, 0)
            const Expense = (isTable ? (expense[allHotels[i]][allDates[j]] as number) : (expense[allHotels[i]][allDates[j]] as IExpenseAnalytics[]).map(a => a.amount).reduce((acc, cur) => {
                return acc + cur
            }, 0))
            aData[allDates[j]] = Math.round((Revenue - Expense) * 100) / 100
        }
        Profit[allHotels[i]] = aData
    }

    return {
        Expense: expense,
        Revenue: revenue,
        Profit: Profit
    }

}

export default findProfitAndLossAnalytics