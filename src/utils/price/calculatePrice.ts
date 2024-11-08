import moment from "moment";
import IHotel from "../../types/hotels/hotel";
import findAccountingDates from "../accounts/findDate";
import getPricingOfDate from "../pricing/getPricingOfDate";

const calculatePrice = async (
  hotel: IHotel,
  rooms: {
    [key: string]: number[];
  },
  checkIn: moment.Moment,
  checkOut: moment.Moment,
) => {
  let aDates = findAccountingDates(checkIn.toDate(), checkOut.toDate())
  let pricings = await Promise.all(aDates.map(async val => {
    return (await getPricingOfDate([hotel], moment(val)))
  }))

  return pricings.reduce((pcc, ccc) => {
    return pcc + Object.keys(rooms).reduce((acc, cur) => {
      return acc + rooms[cur].reduce((accc, currr) => {
        return accc + ccc[hotel._id][cur][`pax${currr <= 3 ? currr : 3}Price`]
      }, 0)
    }, 0)
  }, 0)
};

export default calculatePrice
