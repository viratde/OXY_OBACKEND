import { Document } from "mongoose";
import IBooking from "../types/bookings/booking";
import BookingActions from "../utils/booking/bookingActions";
import bookingPopulate from "../utils/booking/populateData";
import managerBookingFormatter from "../utils/booking/bookingFormatter";
import Manager from "../models/managers/managerSchema";
import IManager from "../types/managers/manager";
import sendFcmMessage from "../utils/fcm/sender";
import bookingUserFormatter from "../utils/booking/bookingUserFormatter";
import IUser from "../types/users/user";
import sendWhatsappMessage from "../utils/whatsapp/sendWhatsappMessage";
import sendSmsMessage from "../utils/sms/sms";
import sendFeedbackFlowMessage from "../utils/whatsappFlows/sendFeebackFlowMessage";


export const bookingNotifierAsEvent = async (
  booking: Document<IBooking>,
  action: BookingActions
) => {

  let nBooking = await booking.populate(bookingPopulate);
  const data = managerBookingFormatter(nBooking as IBooking);

  return {
    event: action.toString(),
    bookingModel: data,
  }
}

const bookingNotifier = async (
  booking: Document<IBooking>,
  action: BookingActions
) => {
  let nBooking = await booking.populate(bookingPopulate);

  const data = managerBookingFormatter(nBooking as IBooking);
  const managers = await Manager.find({
    fcmToken: {
      $ne: "",
    },
    permissions: {
      $elemMatch: {
        hotel: data.hotelId,
        canViewBooking: true,
      },
    },
  });

  let tokens: string[] = managers.map((manager: IManager) => {
    return manager.fcmToken as string;
  });

  if (tokens.length <= 0) {
    return;
  }
  await sendFcmMessage.sendMultipleMessages(
    {
      eventType: action.toString(),
      booking: JSON.stringify(data),
    },
    tokens
  );

  if (action === BookingActions.CollectionUpdated) {
    return
  }
  const userData = bookingUserFormatter(nBooking as IBooking);
  const userFcmToken = ((nBooking as IBooking).userId as IUser).fcmToken;
  if (userFcmToken) {
    await sendFcmMessage.sendMessage(
      {
        eventType: action.toString(),
        booking: JSON.stringify(userData),
      },
      userFcmToken
    );
  }

  if (action == BookingActions.CheckedIn || action == BookingActions.Created) {
    sendWhatsappMessage(booking as IBooking)
    sendSmsMessage(booking as IBooking)
  }

  if (action == BookingActions.CheckedOut) {
    sendFeedbackFlowMessage(
      (booking as IBooking).phoneNumber,
      process.env.WA_SELECTED_PHONE_NUMBER_ID as string,
      process.env.WA_BEARER_TOKEN as string,
      (booking as IBooking).bookingId
    )
  }

};

export default bookingNotifier;
