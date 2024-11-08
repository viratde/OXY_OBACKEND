import IBooking from "../../types/bookings/booking";

const bookingStatusFinder = (booking: IBooking) => {
  if (booking.isCancelled) {
    return "Cancelled";
  } else if (booking.hasNotShown) {
    return "NotShown";
  } else if (booking.hasCheckedOut) {
    return "Checked Out";
  } else if (booking.hasCheckedIn) {
    return "Checked In";
  } else {
    return "Upcoming";
  }
};

export default bookingStatusFinder