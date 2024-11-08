// import Hotel from "../models/hotels/hotelModel";
// import IBooking from "../types/bookings/booking";
// import IHotel from "../types/hotels/hotel";
// import bookings from "./bookings.json";
// import mongoose, { Types } from "mongoose";

// const run = async () => {
//   let connection = await mongoose.connect(
//     "mongodb://127.0.0.1:27017/OxyTsTestDatabase"
//   );
//   console.log(
//     "Database Connected Successfully at",
//     connection.connection.host,
//     connection.connection.port
//   );
// };

// run();

// async function migrate() {
//   const allHotels = await Hotel.find();
//   for (let i = 0; i < bookings.length; i++) {
//     let selectedBooking = bookings[i];
//     let selectedHotel = allHotels.find(
//       (hotel) => hotel._id == selectedBooking.hotelId.$oid
//     ) as IHotel;
//     console.log(selectedHotel);
//     let mBook: IBooking = {
//       hotelId: selectedHotel._id,
//       userId: new Types.ObjectId(selectedBooking.userId.$oid),
//       name: selectedBooking.name,
//       phoneNumber: selectedBooking.phone.$numberLong,
//       bookedRooms: Object.fromEntries(
//         selectedBooking.bookedRooms.map((room) => {
//           return [room.roomType, room.noOfGuests];
//         })
//       ),
//       allotedRooms: selectedBooking.bookedRooms.map((room) => {
//         return {
//           roomType: room.roomType,
//           noOfGuests: room.noOfGuests,
//           noOfRooms: room.noOfRooms,
//           startDate: new Date(selectedBooking.checkIn.$date),
//           endDate: new Date(selectedBooking.checkOut.$date),
//         };
//       }),
//       amount:selectedBooking.amount,
//       bookingAmount:selectedBooking.bookingAmount,
//       checkIn: new Date(selectedBooking.checkIn.$date),
//       checkOut: new Date(selectedBooking.checkOut.$date),
//       actualCheckIn:new Date(selectedBooking.checkIn.$date),
//       actualCheckOut:new Date(selectedBooking.checkOut.$date),
//       canStayCheckIn:new Date(selectedBooking.checkIn.$date),
//       bookingId:selectedBooking.bookingId.toString(),
//       referenceId:selectedBooking.referenceId,
//       actionCode:selectedBooking.actionCode.$numberLong,
//       isCreatedByManager:selectedBooking.isCreatedByManager,
//       isAdvancedPayment:selectedBooking.isAdvancedPayment,
//       advancedPaymentData:(selectedBooking.advancedPaymentData) ? {
//         cash:(selectedBooking.advancedPaymentData.method.toLowerCase() == "cash" ? selectedBooking.advancedPaymentData.amount : 0),
//         bank:(selectedBooking.advancedPaymentData.method.toLowerCase() == "bank" ? selectedBooking.advancedPaymentData.amount : 0),
//         ota:(selectedBooking.advancedPaymentData.method.toLowerCase() == "ota" ? selectedBooking.advancedPaymentData.amount : 0),
//         total:selectedBooking.advancedPaymentData.amount,
//         date:new Date(selectedBooking.createdAt.$date),
//         by:new Types.ObjectId(selectedBooking.userId.$oid)
//       } : undefined,
//       hasCheckedIn:selectedBooking.hasCheckedIn,
//       checkInTime: new Date(selectedBooking.checkInTime.$date),
//       checkedInData:undefined,
//       hotelCheckInTime: selectedHotel.checkIn,
//       hotelCheckOutTime: selectedHotel.checkOut,
//       timezone: selectedHotel.timezone,
//       hasCheckedOut:selectedBooking.hasCheckedOut,
//       checkOutTime: new Date(selectedBooking.checkedOutData.$date),
//       checkedOutData:undefined,
      
//     };
//   }
// }

// migrate();
