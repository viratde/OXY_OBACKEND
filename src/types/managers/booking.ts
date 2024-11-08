import { BookingDataTypes } from "../../utils/booking/BookingTypeFormatterHelper";

interface IManagerCancel {
    name: string,
    date: Date
}

interface IManagerAssignedRoom {
    rooms: Array<IManagerRoom>;
    assignedBy: string;
    date: Date
}

interface IManagerRoomShift {
    from: IManagerAssignedRoom,
    to: IManagerAssignedRoom,
    date: Date
}

interface IManagerExtraCharge {
    date: Date;
    revenueDate: Date;
    revenueAmount: number;
    addedBy: string;
    note: string;
    type: string;
    extendedTime: number | undefined,
    ecId: string
}


interface IManagerRoom {
    roomNo: string,
    roomType: string
}

interface IManagerPayment {
    cash: number;
    bank: number;
    ota: number;
    total: number,
    date: Date,
    by: string,
    transaction?: {
        name: string,
        isSuccessful: boolean,
        amount: number
    }
}

interface IManagerFeedback {
    check_in_experience: number,
    staff_frendiliness: number,
    amenities_provided: number,
    room_ceanliness: number,
    room_comfort: number,
    suggestion: string,
    date: string
}
interface IManagerBooking {
    _id: string,
    hotelId: string;
    userId: string;
    name: string;
    phoneNumber: string;
    bookedRooms: { [key: string]: Array<number> };
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
    createdBy: string | undefined;
    isAdvancedPayment: boolean;
    advancedPaymentData: number | undefined;
    isConveniencePayment: boolean;
    convenienceAmount: number | undefined;

    isCancelled: boolean;
    cancelledData: IManagerCancel | undefined;


    hasNotShown: boolean;
    noShowData: IManagerCancel | undefined;


    hasCheckedIn: boolean;
    checkInTime: Date | undefined;
    checkedInData: IManagerCancel | undefined;


    hasCheckedOut: boolean;
    checkOutTime: Date | undefined;
    checkedOutData: IManagerCancel | undefined;

    isRoomAssigned: boolean;
    assignedRoom: IManagerAssignedRoom | undefined;

    isPaymentCollected: boolean,
    collections: Array<IManagerPayment>,

    extraCharges: Array<IManagerExtraCharge>;

    isMoneyPending: boolean,
    wasMoneyPending: boolean,
    timezone: string,
    hotelCheckInTime: string,
    hotelCheckOutTime: string,
    roomShifts: Array<IManagerRoomShift>,
    feedback: IManagerFeedback | undefined,


    type: BookingDataTypes,
    department?: string,

    tid?:{
        id:string,
        encryption:string
    }
}

export default IManagerBooking