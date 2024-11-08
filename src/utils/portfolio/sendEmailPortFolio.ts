import { transporter } from "../auth/sendOtpOnEmail";

const sendEmailPortfolio = async (
    email: string,
    attachements: { filename: string, content: any, contentType: any }[],
    data: { key: string, value: any }[],
    hotelName: string
): Promise<boolean> => {
    try {
        let info = {
            from: process.env.EMAIL_ID as string,
            to: email,
            subject: `Hotel Details ${hotelName}`,
            html: `<div style="text-align: left; padding: 20px;">
          </div>
          <p style="text-align: left; font-size: 18px;">Hi <b></b>.
          <p style="text-align: left; margin-top: 20px">Thanks for registering with OXY Hotel.Here is the details</p>
          <div style="text-align: left; margin-bottom: 20px; margin-top: 20px">
          ${data.map(a => `<p style="text-align: left; margin-top: 2px">${a.key} - ${a.value}</p>`).join("")}
          </div>
          <p style="text-align: left; margin-bottom: 20px; margin-top: 20px">Thanks,</p>
          <p style="text-align: left;">Oxyhotels<br>Oxy Corporations</p>`,
            attachments: attachements
        };

        return new Promise(function (resolve, reject) {
            transporter.sendMail({ ...info }, (err, resp) => {
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

export default sendEmailPortfolio
