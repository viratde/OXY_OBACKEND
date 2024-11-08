import mongoose, { SchemaTypeOptions, Types } from "mongoose";
import IBooking from "../../types/bookings/booking";

const bookingSchema = new mongoose.Schema<IBooking>({
  hotelId: {
    type: Types.ObjectId,
    ref: "Hotels",
  },
  userId: {
    type: Types.ObjectId,
    ref: "users",
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  bookedRooms: {
    type: Object,
    required: true,
  },
  allotedRooms: {
    type: [Object],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  bookingAmount: {
    type: Number,
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  actualCheckIn: {
    type: Date,
    required: true
  },
  actualCheckOut: {
    type: Date,
    required: true
  },
  canStayCheckIn: {
    type: Date,
    required: true
  },
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  actionCode: {
    type: String,
    required: true,
    unique: true
  },
  referenceId: {
    type: String,
  },
  isCreatedByManager: {
    type: Boolean,
    default: false,
    required: true,
  },
  createdBy: {
    type: Types.ObjectId,
    ref: "managers",
  },
  isAdvancedPayment: {
    type: Boolean,
    default: false,
  },
  advancedPaymentData: Object,
  isConveniencePayment: {
    type: Boolean,
    default: false,
  },
  convenienceAmount: {
    type: Number,
    default: 0,
    required: true,
  },

  isCancelled: {
    type: Boolean,
    default: false,
  },
  cancelledData: Object,

  hasNotShown: {
    type: Boolean,
    default: false,
    required: true,
  },
  noShowData: Object,

  hasCheckedIn: {
    type: Boolean,
    required: true,
    default: false,
  },
  checkInTime: Date,
  checkedInData: Object,

  hasCheckedOut: {
    type: Boolean,
    required: true,
    default: false,
  },
  checkOutTime: Date,
  checkedOutData: Object,


  isRoomAssigned: {
    type: Boolean,
    default: false,
    required: true
  },
  assignedRoom: Object,

  isPaymentCollected: {
    type: Boolean,
    default: false,
    required: true
  },
  collections: {
    type: [Object],
    required: true,
    default: []
  },
  deletedCollections: {
    type: [Object],
    required: true,
    default: []
  },
  extraCharges: {
    type: [Object],
    required: true,
    default: []
  },
  deletedExtraCharges: {
    type: [Object],
    required: true,
    default: []
  },
  amountModifications: {
    type: [Object],
    required: true,
    default: []
  },
  isMoneyPending: {
    type: Boolean,
    default: false,
    required: true
  },
  wasMoneyPending: {
    type: Boolean,
    default: false,
    required: true
  },
  timezone: {
    type: String,
    required: true
  },
  roomShifts: {
    type: [Object],
    default: [],
    required: true
  },
  hotelCheckInTime: {
    type: String,
    required: true
  },
  hotelCheckOutTime: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  bookingSource: {
    type: String,
    required: true
  },
  feedback: {
    type: Object,
  },
  
}, {
  timestamps: true,
});

SchemaTypeOptions

const Bookings = mongoose.model<IBooking>("bookings", bookingSchema);
export const CompletedBookings = mongoose.model<IBooking>(
  "completeBookings",
  bookingSchema
);

export default Bookings;
