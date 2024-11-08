interface IPriceRequest {
    pax1Price: number,
    pax2Price: number,
    pax3Price: number,
    startTime: string,
    endTime: string,
    roomType: string
}
export interface IPriceSetter {
    eStartTime: moment.Moment,
    eEndTime: moment.Moment,
    pax1Price: number,
    pax2Price: number,
    pax3Price: number,
    roomType: string
}

export default IPriceRequest