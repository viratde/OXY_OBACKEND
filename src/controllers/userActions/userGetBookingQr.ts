import { Request, Response } from "express";
import Bookings from "../../models/bookings/bookingModel";
import moment from "moment";
import Qr from "../../utils/qr/decrypt";
import qrcode from "qrcode";

const userGetBookingQr = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const bookingId = req.query.bookingId;
    if (!bookingId) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct bookingId." });
    }

    const booking = await Bookings.findOne({ bookingId: bookingId });

    if (!booking) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct bookingId" });
    }
    const data = JSON.stringify({
      bookingId: bookingId,
      issued_at: moment(new Date())
        .tz("Asia/Kolkata")
        .format("DD-MM-YYYY HH:mm:ss"),
    });
    const encryptedData = Qr.encryptQrData(data);
    qrcode.toFileStream(
      res,
      encryptedData,
      {
        errorCorrectionLevel: "H",
        margin: 1,
        scale: 10,
        color: {
          dark: "#FFFFFFFF",
          light: "#181818FF",
        },
      },
      (err) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .send("An error occurred while generating the QR code");
        }
      }
    );
    return res;
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default userGetBookingQr;
