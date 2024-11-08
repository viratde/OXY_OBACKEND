interface IRevenueReconcilationBooking{
    hotelId:string,
    bookingId: string,
    rooms: number,
    name: string,
    phoneNumber: string,
    stay: string,
    amount: number,
    status: string,
    data: {
        [key:string]:Array<IRevenueReconcilationBookingPayment>
    },
    REV:{[key:string]:number},
    PEND:number,
    roomStayed:string[]
}

export interface IRevenueReconcilationBookingPayment{
    date:string,
    method:string,
    effectiveValue:number,
    actualValue:number,
    transId:string | null
}

export default IRevenueReconcilationBooking