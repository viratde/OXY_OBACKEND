import { Document, Types } from "mongoose";
import IHotel from "../hotels/hotel";
import IUser from "../users/user";
import IAllotedRoom from "./allotedRoom";
import IManager from "../managers/manager";
import Payment from "./payment";
import IPayment from "./payment";
import ICancel from "./cancel";
import INoShow from "./NoShow";
import ICheckInCheckOut from "./checkInCheckOut";
import IAssignedRoom from "./AssignedRoom";
import IExtraCharge from "./ExtraCharge";
import IRoomShift from "./roomShift";
import IDeletedPayment from "./DeletedPayment";
import IDeletedExtraCharge from "./DeletedExtraCharge";
import IAmountModification from "./AmountModifications";
import BookingSource from "../../enums/BookingSource";
import IFeedBack from "./Feedback";

interface IBooking extends Document {

  hotelId: Types.ObjectId | IHotel;
  userId: Types.ObjectId | IUser;
  name: string;
  phoneNumber: string;
  bookedRooms: { [key: string]: Array<number> };
  allotedRooms: Array<IAllotedRoom>;
  amount: number;
  bookingAmount: number;
  checkIn: Date;
  checkOut: Date;
  actualCheckIn: Date;
  actualCheckOut: Date;
  canStayCheckIn: Date;
  bookingId: string;
  actionCode: string;
  referenceId: string | undefined;
  isCreatedByManager: boolean;
  createdBy: Types.ObjectId | IManager | undefined;
  isAdvancedPayment: boolean;
  advancedPaymentData: IPayment | undefined;
  isConveniencePayment: boolean;
  convenienceAmount: number | undefined;

  isCancelled: boolean;
  cancelledData: ICancel | undefined;


  hasNotShown: boolean;
  noShowData: INoShow | undefined;


  hasCheckedIn: boolean;
  checkInTime: Date | undefined;
  checkedInData: ICheckInCheckOut | undefined;


  hasCheckedOut: boolean;
  checkOutTime: Date | undefined;
  checkedOutData: ICheckInCheckOut | undefined;

  isRoomAssigned: boolean;
  assignedRoom: IAssignedRoom | undefined;

  isPaymentCollected: boolean,
  collections: Array<Payment>,
  deletedCollections: Array<IDeletedPayment>,

  extraCharges: Array<IExtraCharge>;
  deletedExtraCharges: Array<IDeletedExtraCharge>,
  amountModifications: Array<IAmountModification>,

  isMoneyPending: boolean,
  wasMoneyPending: boolean

  timezone: string,

  roomShifts: Array<IRoomShift>,
  hotelCheckInTime: string,
  hotelCheckOutTime: string,
  createdAt: Date,
  bookingSource: BookingSource,
  feedback: IFeedBack | undefined
}

export default IBooking