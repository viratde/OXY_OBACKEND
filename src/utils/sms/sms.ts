import axios from "axios";
import IBooking from "../../types/bookings/booking";
import moment from "moment-timezone";

async function sendSmsMessage(booking: IBooking) {
  try {
    await axios.get(getRequestParameter(`+${booking.phoneNumber}`, booking));
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function getRequestParameter(recipient: string, booking: IBooking) {
  if (booking.hasCheckedIn) {
    return `https://www.txtguru.in/imobile/api.php?username=oxyitsolutions&password=67011423&source=OXYCRP&dmobile=${recipient}&dlttempid=1707169311702468993&message=Dear Customer, You have successfully checked in to oxyhotels. Your checkout code is ${booking.actionCode} and ticket is oxyhotels.com/api/t/${booking.actionCode}. OXYCRP`;
  } else {
    return `https://www.txtguru.in/imobile/api.php?username=oxyitsolutions&password=67011423&source=OXYCRP&dmobile=${recipient}&dlttempid=1707169311623673200&message=Dear Customer, Your Booking is confirmed from ${moment(booking.checkIn).format("DD-MM-YYYY")} to ${moment(booking.checkOut).format("DD-MM-YYYY")} in Oxyhotels. Your checkin code is ${
      booking.actionCode
    } and ticket is oxyhotels.com/api/t/${booking.actionCode}. OXYCRP`;
  }
}

export default sendSmsMessage