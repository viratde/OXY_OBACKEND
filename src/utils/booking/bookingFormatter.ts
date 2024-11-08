import IBooking from "../../types/bookings/booking";
import IManagerBooking from "../../types/managers/booking";
import IManager from "../../types/managers/manager";
import IRoom from "../../types/hotels/room";
import IPayment from "../../types/bookings/payment";
import IExtraCharge from "../../types/bookings/ExtraCharge";
import moment from "moment";
import BookingTypeFormatterHelper, { findBookingStatus } from "./BookingTypeFormatterHelper";
import IHotel from "../../types/hotels/hotel";
import BookingIdEncryptAndDecrypt from "./idEncryptAndDecrypt";

const managerBookingFormatter = (booking: IBooking, type: (BookingTypeFormatterHelper | undefined) = undefined): IManagerBooking => {

  return {
    _id: booking._id,
    hotelId: booking.hotelId._id,
    userId: booking.userId._id,
    name: booking.name,
    phoneNumber: booking.phoneNumber,
    bookedRooms: booking.bookedRooms,
    amount: booking.amount,
    bookingAmount: booking.bookingAmount,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    actualCheckIn: booking.actualCheckIn,
    actualCheckOut: booking.actualCheckOut,
    canStayCheckIn: booking.canStayCheckIn,
    bookingId: booking.bookingId,
    actionCode: booking.actionCode,
    referenceId: booking.referenceId,
    isCreatedByManager: booking.isCreatedByManager,
    createdBy: (booking.createdBy as IManager)?.name ? (booking.createdBy as IManager)?.name : undefined,
    isAdvancedPayment: booking.isAdvancedPayment,
    advancedPaymentData: booking.advancedPaymentData?.total,
    isConveniencePayment: booking.isConveniencePayment,
    convenienceAmount: booking.convenienceAmount,
    isCancelled: booking.isCancelled,
    cancelledData:
      booking.cancelledData != null
        ? {
          name: (booking.cancelledData.cancelledBy as IManager)?.name ? (booking.cancelledData.cancelledBy as IManager)?.name : booking.name,
          date: booking.cancelledData.date,
        }
        : undefined,
    hasNotShown: booking.hasNotShown,
    noShowData:
      booking.noShowData != null
        ? {
          name: (booking.noShowData.noShownBy as IManager)?.name,
          date: booking.noShowData.date,
        }
        : undefined,
    hasCheckedIn: booking.hasCheckedIn,
    checkInTime: booking.checkInTime,
    checkedInData:
      booking.checkedInData != null
        ? {
          name: (booking.checkedInData.by as IManager)?.name,
          date: booking.checkedInData.date,
        }
        : undefined,
    hasCheckedOut: booking.hasCheckedOut,
    checkOutTime: booking.checkOutTime,
    checkedOutData:
      booking.checkedOutData != null
        ? {
          name: (booking.checkedOutData.by as IManager)?.name,
          date: booking.checkedOutData.date,
        }
        : undefined,
    isRoomAssigned: booking.isRoomAssigned,
    assignedRoom:
      booking.assignedRoom != null
        ? {
          date: booking.assignedRoom.date,
          rooms: booking.assignedRoom.rooms.map((room) => {
            let nRoom = room as IRoom;
            return {
              roomNo: nRoom.roomNo,
              roomType: nRoom.roomType,
            };
          }),
          assignedBy: (booking.assignedRoom.assignedBy as IManager)?.name,
        }
        : undefined,
    isPaymentCollected: booking.isPaymentCollected,
    collections: booking.collections.map((collection) => {
      let nCollection = collection as IPayment;
      return {
        cash: nCollection.cash,
        bank: nCollection.bank,
        ota: nCollection.ota,
        total: nCollection.total,
        date: nCollection.date,
        by: (nCollection.by as IManager)?.name,
        colId: nCollection.colId,
        transaction: nCollection.transaction ? {
          isSuccessful: nCollection.transaction.isVerified,
          name: nCollection.transaction.paymentMode + (nCollection.transaction.isVerified ? "" : " (Pend)"),
          amount: Number(nCollection.total),
        } : undefined
      };
    }),
    isMoneyPending: booking.isMoneyPending,
    wasMoneyPending: booking.wasMoneyPending,
    extraCharges: booking.extraCharges.map((extraCharge) => {
      let nExtraCharge = extraCharge as IExtraCharge;
      return {
        date: nExtraCharge.date,
        revenueAmount: nExtraCharge.revenueAmount,
        revenueDate: nExtraCharge.revenueDate,
        extendedTime: nExtraCharge.extendedTime,
        note: nExtraCharge.note,
        type: nExtraCharge.type,
        addedBy: (nExtraCharge.addedBy as IManager)?.name,
        ecId: nExtraCharge.ecId
      };
    }),
    timezone: booking.timezone,
    hotelCheckInTime: booking.hotelCheckInTime,
    hotelCheckOutTime: booking.hotelCheckOutTime,
    roomShifts: booking.roomShifts.map(roomShift => {
      return {
        from: {
          date: roomShift.from.date,
          rooms: roomShift.from.rooms.map((room) => {
            let nRoom = room as IRoom;
            return {
              roomNo: nRoom.roomNo,
              roomType: nRoom.roomType,
            };
          }),
          assignedBy: (roomShift.from.assignedBy as IManager)?.name,
        },
        to: {
          date: roomShift.to.date,
          rooms: roomShift.to.rooms.map((room) => {
            let nRoom = room as IRoom;
            return {
              roomNo: nRoom.roomNo,
              roomType: nRoom.roomType,
            };
          }),
          assignedBy: (roomShift.to.assignedBy as IManager)?.name,
        },
        date: roomShift.date
      }
    }),
    feedback: booking.feedback ? ({
      check_in_experience: booking.feedback.check_in_experience,
      staff_frendiliness: booking.feedback.staff_frendiliness,
      suggestion: booking.feedback.suggestion,
      room_ceanliness: booking.feedback.room_ceanliness,
      room_comfort: booking.feedback.room_comfort,
      amenities_provided: booking.feedback.amenities_provided,
      date: moment.tz(booking.feedback.date, booking.timezone).format("DD MMM YYYY HH:mm")
    }) : undefined,
    type: findBookingStatus(
      booking,
      type
    ),
    department: booking.isCreatedByManager ? (booking.createdBy as IManager)?.department?.bookingShort : undefined,
    tid: (booking.hotelId as IHotel).tid ? {
      id: (booking.hotelId as IHotel).tid!!,
      encryption: BookingIdEncryptAndDecrypt.encryptId((booking.bookingId))
    } : undefined,
  };
};

export default managerBookingFormatter;
