import IBooking from "../../types/bookings/booking";
import moment from "moment-timezone";

const revenueCalculator = (booking: IBooking, date: string) => {
  const noOfDates = Math.ceil(
    (moment(booking.checkOut).unix() - moment(booking.checkIn).unix()) /
    (24 * 60 * 60)
  );
  const bookingRevenue = booking.bookingAmount / noOfDates;
  const extraChargesReveue = booking.extraCharges
    .filter((extraCharge) => {
      return (
        moment.tz(extraCharge.revenueDate, booking.timezone).format("DD-MM-YYYY") ==
        date
      );
    })
    .reduce((acc, cur) => acc + cur.revenueAmount, 0);

  return {
    XBR: (booking.referenceId || booking.isConveniencePayment) ? 0 : bookingRevenue,
    XECR: (booking.referenceId || booking.isConveniencePayment) ? 0 : extraChargesReveue,
    OBR: (!booking.referenceId && !booking.isConveniencePayment) ? 0 : bookingRevenue,
    OECR: (!booking.referenceId && !booking.isConveniencePayment) ? 0 : extraChargesReveue,
    CFEE: (booking.convenienceAmount ? booking.convenienceAmount : 0) / noOfDates
  };
  
};

const collectionCalculator = (booking: IBooking, date: string) => {
  return booking.collections
    .filter((collection) => {
      return (
        moment.tz(collection.date, booking.timezone).format("DD-MM-YYYY") ==
        date
      );
    })
    .reduce(
      (acc, cur) => {
        return {
          Cash: acc.Cash + cur.cash,
          Bank: acc.Bank + cur.bank,
          Ota: acc.Ota + cur.ota,
        };
      },
      {
        Cash: 0,
        Bank: 0,
        Ota: 0,
      }
    );
};

const salesCalculators = (booking: IBooking, date: string) => {

  const bookingSales = moment.tz(booking.createdAt, booking.timezone).format("DD-MM-YYYY") == date ? booking.bookingAmount : 0
  const extraChargeSales = booking.extraCharges.filter(extraCharge => {
    return moment.tz(extraCharge.date, booking.timezone).format("DD-MM-YYYY") == date
  }).reduce((acc, cur) => (acc + cur.revenueAmount), 0)
  return {
    XBS: (booking.referenceId || booking.isConveniencePayment) ? 0 : bookingSales,
    XECS: (booking.referenceId || booking.isConveniencePayment) ? 0 : extraChargeSales,
    OBS: (!booking.referenceId && !booking.isConveniencePayment) ? 0 : bookingSales,
    OECS: (!booking.referenceId && !booking.isConveniencePayment) ? 0 : extraChargeSales,
    CFEE: booking.convenienceAmount ? booking.convenienceAmount : 0
  }
}

const accountCalculators = {
  revenueCalculator,
  collectionCalculator,
  salesCalculators
};

export default accountCalculators;
