import verifyTokenController from "./verifyTokenController"
import userGetHotelsController from "./userGetHotelsController"
import getAllBookingsController from "./userGetAllBookings"
import updateUserDetailsController from "./userUpdateDetailsController"
import userBookingCreateController from "./userCreateBookingController"
import userGetBookingQr from "./userGetBookingQr"
import cancelBookingController from "./cancelBookingController"
import userPostReviewController from "./userPostReviewController"

const userActionsController = {
    verifyTokenController,
    userGetHotelsController,
    getAllBookingsController,
    updateUserDetailsController,
    userBookingCreateController,
    userGetBookingQr,
    cancelBookingController,
    userPostReviewController
}
export default userActionsController