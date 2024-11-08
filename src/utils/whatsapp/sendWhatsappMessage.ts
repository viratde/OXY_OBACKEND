import IBooking from "../../types/bookings/booking";
import sendWhatsappTemplateMessage from "./sendWatiWhatsappMessages";


const sendWhatsappMessage = async (booking: IBooking) => {
  try {

    if (booking.hasCheckedIn) {
      await sendWhatsappTemplateMessage.sendCheckOutCodeMessage(booking)
    } else {
      await sendWhatsappTemplateMessage.sendCheckInCodeMessage(booking)
    }
  } catch (err) {
    console.log(err);
  }
};
export default sendWhatsappMessage;
