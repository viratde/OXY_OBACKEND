interface ICollectionConcilationBooking{
    hotelId:string,
    bookingId: string,
    rooms: number,
    name: string,
    phoneNumber: string,
    stay: string,
    amount: number,
    status: string,
    data: {
        [key:string]:Array<ICollectionConcilationBookingPayment>
    }
}

export interface ICollectionConcilationBookingPayment{
    date:string,
    method:string,
    effectiveValue:number,
    actualValue:number,
    transId:string | null
}

export default ICollectionConcilationBooking