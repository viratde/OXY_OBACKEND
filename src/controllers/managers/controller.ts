import managerBookingController from "./booking/controller"
import managerBookingActionController from "./bookingActions/controller"
import managerBookingAuthController from "./auth/controller"
import bookingAnalyticsController from "./bookingAnalytics/controller"
import managerAccountingAnalyticscontroller from "./accountAnalytics/controller"
import managerRevenueReconcilationController from "./revenueReconcilation/controller"
import managerCollectionConcilationController from "./collectionConcilation/controller"
import managerPricingController from "./pricing/managerPricingController"
import expenseController from "./expenses/controller"
import analyticsController from "./analytics/controller"
import expenseControllerr from "./expense/controller"
import placeCallController from "./dialer/placeCallController"

const managerController = {
    ...managerBookingController,
    ...managerBookingActionController,
    ...managerBookingAuthController,
    ...bookingAnalyticsController,
    ...managerAccountingAnalyticscontroller,
    ...managerRevenueReconcilationController,
    ...managerCollectionConcilationController,
    ...managerPricingController,
    ...expenseController,
    ...analyticsController,
    ...expenseControllerr,
    placeCallController
}

export default managerController