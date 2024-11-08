import managerGetBookingSalesAnalytics from "./getBookingSalesAnalyticsController"
import managerGetBookingCheckInAnalyticsController from "./getBookingCheckInAnalyticsController"
import managerGetBookingCheckOutAnalyticsController from "./getBookingCheckOutAnalyticsController"
import managerGetBookingRevenueAnalyticsController from "./getBookingRevenueAnalyticsController"
import managerGetBookingCollectionAnalyticsController from "./getBookingCollectionAnalyticsController"
import managerGetAccountSalesAnalyticsController from "./getAccountSalesAnalyticsController"
import managerGetBookingSummaryAnalyticsController from "./getBookingSummaryAnalyticsController"
import managerGetFeedbackAnalyticsController from "./getFeedbackAnalyticsController"
import getFeedbackCountAnalyticsController from "./getFeedbackCountAnalyticsController"
import getUsersAnalyticsForBookingsController from "./getUsersAnalyticsForBookingsController"
import getUsersAnalyticsController from "./getUserAnalyticsController"

const analyticsController = {
    managerGetBookingSalesAnalytics,
    managerGetBookingCheckInAnalyticsController,
    managerGetBookingCheckOutAnalyticsController,
    managerGetBookingRevenueAnalyticsController,
    managerGetBookingCollectionAnalyticsController,
    managerGetAccountSalesAnalyticsController,
    managerGetBookingSummaryAnalyticsController,
    managerGetFeedbackAnalyticsController,
    getFeedbackCountAnalyticsController,
    getUsersAnalyticsForBookingsController,
    getUsersAnalyticsController
}

export default analyticsController