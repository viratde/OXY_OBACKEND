import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL_ID as string,
    pass: process.env.EMAIL_PASS as string,
  },
});

const sendOtpOnEmail = async (email: string, otp: number) :Promise<boolean> => {
  try {
    let info = {
      from: process.env.EMAIL_ID as string,
      to: email,
      subject: " Verify Your Account",
      text: "Please verify your account",
      html: `<div style="text-align: left; padding: 20px;">
        </div>
        <p style="text-align: left; font-size: 18px;">Hi <b> Customer,</b> your otp is <b>${otp} .</b></p>
        <p style="text-align: left; margin-top: 20px">Thanks for registering with OXY Hotel.Please Enter your OTP to conform your login</p>
        <div style="text-align: left; margin-bottom: 20px; margin-top: 20px">
        </div>
        <p style="text-align: left; margin-bottom: 20px; margin-top: 20px">Thanks,</p>
        <p style="text-align: left;">Oxyhotels<br>Oxy Corporations</p>`,
    };

    return new Promise(function (resolve, reject) {
      transporter.sendMail(info, (err, resp) => {
        if (err) {
          console.log(err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } catch (err) {
    console.log(err);
    return false;
  }
};


export default sendOtpOnEmail