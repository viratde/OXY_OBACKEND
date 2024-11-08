import managerController from "../controllers/managers/controller";
import express from "express";
import managerAuthentication from "../utils/authentication/managerAuthentication";
import expenseRouter from "../../expense/src/routes/expenseRoutes";


const managerRouter = express.Router()


//manager authentocation

managerRouter.post("/auth", managerController.managerAuthController)

managerRouter.post("/verifyToken", managerAuthentication, managerController.verifyTokenController)

managerRouter.post("/getPermissions", managerAuthentication, managerController.managerGetPermissionController)




// booking actions

managerRouter.post("/getUserData", managerAuthentication, managerController.managerGetUserData)

managerRouter.post("/createBooking", managerAuthentication, managerController.managerCreateBookingController)

managerRouter.post("/checkInAndCheckOut", managerAuthentication, managerController.checkInAndCheckOutController)

managerRouter.post("/assignRoom", managerAuthentication, managerController.managerAssignRoom)

managerRouter.post("/collectPayment", managerAuthentication, managerController.managerCollectPayment)

managerRouter.post("/addExtraCharge", managerAuthentication, managerController.managerAddExtraCharge)

managerRouter.post("/cancelBooking", managerAuthentication, managerController.managerCancelBooking)

managerRouter.post("/noShowBooking", managerAuthentication, managerController.managerNoShowBooking)

managerRouter.post("/deleteCollection", managerAuthentication, managerController.managerDeleteCollectionController)

managerRouter.post("/deleteExtraCharge", managerAuthentication, managerController.managerDeleteExtraChargeController)

managerRouter.post("/modifyAmount", managerAuthentication, managerController.managerModifyAmount)

// pricing controller

managerRouter.post("/setPricing", managerAuthentication, managerController.managerSetPricingController)

managerRouter.post("/getPricing", managerAuthentication, managerController.managerGetPricingController)


//bookings


managerRouter.post("/getInHouseBookings", managerAuthentication, managerController.managerGetIHouseBookings)

managerRouter.post("/getUpcomingBookings", managerAuthentication, managerController.managerGetUpcomingBookings)

managerRouter.post("/getCompleteBookings", managerAuthentication, managerController.managerGetCompleteBookings)

managerRouter.post("/getActionNeededBookings", managerAuthentication, managerController.managerGetActionNeededBookings)

managerRouter.post("/getPendingPaymentBookings", managerAuthentication, managerController.managerGetPendingPaymentBookings)


//analytics
managerRouter.post("/getBookingAnalytics", managerAuthentication, managerController.managerGetBookingAnalytics)

managerRouter.post("/getAccountingAnalytics", managerAuthentication, managerController.managerGetAccountingAnalytics)

managerRouter.post("/getRevenueReconcilation", managerAuthentication, managerController.managerGetRevenueReconcilation)

managerRouter.post("/getCollectionConcilation", managerAuthentication, managerController.managerGetCollectionConcilation)

managerRouter.use("/expense", managerAuthentication, expenseRouter)

managerRouter.post("/colSync", managerAuthentication, managerController.colSyncController)




managerRouter.post("/getBookingSalesAnalytics", managerAuthentication, managerController.managerGetBookingSalesAnalytics);
managerRouter.post("/getBookingCheckInAnalytics", managerAuthentication, managerController.managerGetBookingCheckInAnalyticsController);
managerRouter.post("/getBookingCheckOutAnalytics", managerAuthentication, managerController.managerGetBookingCheckOutAnalyticsController);
managerRouter.post("/getFeedbackCountAnalytics", managerAuthentication, managerController.getFeedbackCountAnalyticsController)

managerRouter.post("/getUserBookingAnalytics",managerAuthentication,managerController.getUsersAnalyticsForBookingsController)
managerRouter.post("/getUserAnalytics",managerAuthentication,managerController.getUsersAnalyticsController)

managerRouter.post("/getBookingRevenueAnalytics", managerAuthentication, managerController.managerGetBookingRevenueAnalyticsController);
managerRouter.post("/getBookingCollectionAnalytics", managerAuthentication, managerController.managerGetBookingCollectionAnalyticsController);
managerRouter.post("/getAccountSalesAnalytics", managerAuthentication, managerController.managerGetAccountSalesAnalyticsController);


managerRouter.post("/getBookingSummaryAnalytics", managerAuthentication, managerController.managerGetBookingSummaryAnalyticsController)
managerRouter.post("/getFeedbackAnalytics", managerAuthentication, managerController.managerGetFeedbackAnalyticsController)

managerRouter.post("/getHotelPartners", managerAuthentication, managerController.managerGetPartnerController)
managerRouter.post("/addHotelPartner", managerAuthentication, managerController.managerAddPartnerController)


managerRouter.post("/addHotelSource", managerAuthentication, managerController.managerAddSourceController)
managerRouter.post("/getHotelAmounts", managerAuthentication, managerController.managerGetAmountsController)


managerRouter.post("/addExpenser", managerAuthentication, managerController.managerAddExpenserController)
managerRouter.post("/getExpensers", managerAuthentication, managerController.managerGetExpenserController)

managerRouter.post("/addExpense", managerAuthentication, managerController.managerAddExpenseController)
managerRouter.post("/createExpense", managerAuthentication, managerController.managerCreateExpenseController)
managerRouter.post("/getCreatedApprovals", managerAuthentication, managerController.managerGetCreatedExpensesController)
managerRouter.post("/getApprovals", managerAuthentication, managerController.managerGetApprovalsController)
managerRouter.post("/getApproveds", managerAuthentication, managerController.managerGetApprovedsController)
managerRouter.post("/approveApproval", managerAuthentication, managerController.managerApproveApprovalController)
managerRouter.post("/approveCreatedApproval", managerAuthentication, managerController.managerApproveCreatedExpenseController)
managerRouter.post("/addPayment", managerAuthentication, managerController.managerAddPaymentController)


managerRouter.post("/getTrasactionsAnalytics", managerAuthentication, managerController.managerGetTransactionController)
managerRouter.post("/getProfitAndLossAnalytics", managerAuthentication, managerController.managerGetProfitAndLossController)
managerRouter.post("/balanceSheetBuilder", managerAuthentication, managerController.balanceSheetBuilderController)

managerRouter.post("/getPendingAdvances", managerAuthentication, managerController.managerGetAdvancesController)

managerRouter.post("/clearPendingAdvances", managerAuthentication, managerController.managerClearAdvancesController)

managerRouter.post("/deleteTransaction", managerAuthentication, managerController.managerDeleteTransactionController)


managerRouter.post("/placeCall", managerAuthentication, managerController.placeCallController)
export default managerRouter