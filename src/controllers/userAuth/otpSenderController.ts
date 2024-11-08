import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import sendOtpOnPhone from "../../utils/auth/sendOtpOnPhone";
import sendOtpOnEmail from "../../utils/auth/sendOtpOnEmail";
import sendCodeOnCall from "../../utils/voice/sendCodeOnCall";
import sendWhatsappTemplateMessage from "../../utils/whatsapp/sendWatiWhatsappMessages";

const sendOtpOnPhoneOrEmailController = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const { data } = req.body;

  try {
    if (
      !data &&
      !data.includes("@") &&
      (isNaN(Number(data)) || data.length != 10)
    ) {
      return res
        .status(400)
        .json({
          status: false,
          message: "Please enter correct email or phone",
        });
    }

    let otpStatus = false;
    let otp = Math.floor(Math.random() * (999999 - 100000)) + 100000;

    if (data.includes("@")) {
      otpStatus = await sendOtpOnEmail(data, otp);
    } else {
      otpStatus = await sendOtpOnPhone(otp, `+91${data}`);
      otpStatus = true;
      sendCodeOnCall(otp, `+91${data}`)
      sendWhatsappTemplateMessage.sendOtpWatiMessage(
        `+91${data}`,
        otp.toString()
      )
    }

    if (!otpStatus) {
      return res
        .status(400)
        .json({ status: false, message: "Please try after some time." });
    }
    let verifyToken = jwt.sign({ otp, data: data.includes("@") ? data : `91${data}` }, process.env.JWT_TOKEN as string, {
      expiresIn: 600,
    });
    return res
      .status(200)
      .send({
        status: true,
        message: "Successfully sent otp.",
        data: verifyToken,
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};


export default sendOtpOnPhoneOrEmailController