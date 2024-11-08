

export interface IRevenueAccountAnalyticsBooking {
    hotelId: string,
    bookingId: string,
    rooms: number,
    name: string,
    phoneNumber: string,
    stay: string,
    amount: number,
    status: string,
    sources: string,
    partners: string,
    XBR: number,
    XECR: number,
    OBR: number,
    OECR: number,
    CFEE: number,
    GST: number
}

export interface ICollectionAccountAnalyticsBooking {
    hotelId: string,
    bookingId: string,
    rooms: number,
    name: string,
    phoneNumber: string,
    stay: string,
    amount: number,
    status: string,
    sources: string,
    partners: string,
    Cash: number,
    Bank: number,
    Ota: number
}


interface IAccountAnalyticsBooking {
    hotelId: string,
    bookingId: string,
    rooms: number,
    name: string,
    phoneNumber: string,
    stay: string,
    amount: number,
    status: string,
    data:{
        [key:string]:number
    }
}



export default IAccountAnalyticsBooking