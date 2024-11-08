import { Router } from "express";
const userRouter = Router()
import userActionsController from "../controllers/userActions/controller";
import userAuthentication from "../utils/authentication/userAuthentication";
import getTicketController from "../controllers/ticket/getTicketController";

userRouter.post("/verifyAuthToken",userActionsController.verifyTokenController)

userRouter.post("/getHotels",userAuthentication,userActionsController.userGetHotelsController)

userRouter.post("/getBookings",userAuthentication,userActionsController.getAllBookingsController)

userRouter.post("/updateUser",userAuthentication,userActionsController.updateUserDetailsController)

userRouter.post("/createBooking",userAuthentication,userActionsController.userBookingCreateController)

userRouter.get("/getBookingQR",userActionsController.userGetBookingQr)

userRouter.post("/cancelBooking",userAuthentication,userActionsController.cancelBookingController)

userRouter.post("/postReview",userAuthentication,userActionsController.userPostReviewController)

userRouter.get("/getBookingTicket/:code",getTicketController)
userRouter.get("/t/:code",getTicketController)





export default userRouter