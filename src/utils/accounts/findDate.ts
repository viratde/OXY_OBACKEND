import moment from "moment-timezone";

const findAccountingDates = (
  checkIn: Date,
  checkOut: Date,
): Array<Date> => {

  const noOfDates = Math.ceil((moment(checkOut).unix() - moment(checkIn).unix()) / (24 * 60 * 60));
  let accountingDates = [
    moment(checkIn).toDate()
  ]
  for(let i= 1;i<noOfDates;i++){
    accountingDates.push(moment(checkIn).add(i,"day").toDate())
  }
  return accountingDates;
};

export default findAccountingDates;
