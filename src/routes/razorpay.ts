import { Router } from "express";
import acceptPosPaymentController from "../controllers/razorpay/acceptPosPaymentController";



const razorpayRouter = Router()

razorpayRouter.post("/payment",acceptPosPaymentController)

export default razorpayRouter