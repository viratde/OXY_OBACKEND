import { Types } from "mongoose"
import Bookings from "./src/models/bookings/bookingModel"
import RazorpayTransactionDetailsModel from "./src/models/razorpay/SuccessfulTransaction"

const correctBookingCollection = async (
    txnId: string,
    bookingId: string
  ) => {
  
    const trans = await RazorpayTransactionDetailsModel.findOne({ txnId: txnId })
    if (!trans) {
      console.log("Transaction not found")
      return
    }
    const booking = await Bookings.findOne({ bookingId: bookingId })
    if (!booking) {
      console.log("Booking not found")
      return
    }
  
    let collection = booking.collections.find((collection) => collection.transaction && collection.transaction?.txnId === txnId)
  
    let nCollection = {
      date: trans.postingDate,
      cash: 0,
      bank: 0,
      ota: 0,
      by: new Types.ObjectId("6645b9b4cc6783129e3fa3e7"),
      total: trans.amount,
      colId: trans.txnId,
      curDate: new Date(),
      transaction: {
        method: `TID-${trans.deviceSerial}`,
        isVerified: Boolean(trans.status == "AUTHORIZED"),
        txnId: trans.txnId,
        paymentMode: trans.paymentMode
      }
    }
  
  
    if(collection){
      booking.collections = booking.collections.map((collection) => {
        if (collection.transaction && collection.transaction.txnId === txnId) {
          return nCollection
        }
        return collection
      })
    }else{
      booking.collections.push(nCollection)
    }
    await booking.save()
  
  }

  export default correctBookingCollection