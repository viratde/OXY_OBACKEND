import { Types } from "mongoose";
import getBookingRevenueAnalytics from "../accountAnalytics/getBookingRevenueAnalytics";
import getBookingCollectionAnalytics from "../accountAnalytics/getBookingCollectionAnalytics";
import findExpenseAnalytics from "../expense/analytics/findExpenseAnalytics";



const calculateRevenueCollectionAndExpense = async (
    hotelIds: Types.ObjectId[],
    date: string
) => {


    const [revenue, collection, expense] = await Promise.all([
        getBookingRevenueAnalytics(date, 1, true, hotelIds, true),
        getBookingCollectionAnalytics(date, 1, true, hotelIds, true),
        findExpenseAnalytics(date, 1, true, hotelIds, true)
    ])

    return {
        revenue,
        collection,
        expense
    }

}

export default calculateRevenueCollectionAndExpense;