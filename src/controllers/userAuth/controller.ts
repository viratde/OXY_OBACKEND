import sendOtpOnPhoneOrEmailController from "./otpSenderController"
import verifyOtpController from "./verifyOtpController"
import createAccountControlller from "./createAccountController"
import verifyGoogleCodeController from "./verifyGoogleCodeController"

const userAuthController = {
    sendOtpOnPhoneOrEmailController,
    verifyOtpController,
    createAccountControlller,
    verifyGoogleCodeController
}

export default userAuthController