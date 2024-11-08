import { Router } from "express";
const userAuthRouter = Router()
import userAuthController from "../controllers/userAuth/controller";


userAuthRouter.post("/",userAuthController.sendOtpOnPhoneOrEmailController)

userAuthRouter.post("/verify",userAuthController.verifyOtpController);

userAuthRouter.post("/createAccount",userAuthController.createAccountControlller)

userAuthRouter.post("/google/verify",userAuthController.verifyGoogleCodeController)

export default userAuthRouter