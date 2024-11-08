import { Request, Response } from "express";
import RazorpayTransactionDetailsModel from "../../models/razorpay/SuccessfulTransaction";
import { PaymentTransaction } from "../../types/bookings/RazorpayPayment";
import Bookings from "../../models/bookings/bookingModel";
import moment from "moment";
import { Types } from "mongoose";

const acceptPosPaymentController = async (req: Request, res: Response) => {

    try {

        const data = req.body as PaymentTransaction
        try {
            if (!(await RazorpayTransactionDetailsModel.findOne({ txnId: req.body.txnId }))) {
                const successTransaction = await RazorpayTransactionDetailsModel.create({
                    ...req.body,
                    paymentCardBrand: req.body.paymentCardBrand ? req.body.paymentCardBrand : "UNKNOWN",
                })

                let booking = await Bookings.findOne({
                    bookingId: data.externalRefNumber
                })

                if (!booking) {
                    booking = await Bookings.findOne({
                        "collections.transaction.txnId": data.txnId
                    })
                }

                if (booking) {

                    let thatCollection = booking.collections.find((collection) => {
                        return collection.transaction && collection.transaction.txnId == req.body.txnId
                    })

                    if (thatCollection && thatCollection.transaction) {
                        thatCollection.transaction.isVerified = successTransaction.status == "AUTHORIZED" ? true : false
                        booking.collections = booking.collections.map((collection) => {
                            if (thatCollection && collection.colId == thatCollection.colId) {
                                return thatCollection
                            }
                            return collection
                        })
                        await booking.save()
                    } else {
                        let curdate = moment(new Date());
                        booking.collections.push({
                            date: curdate.toDate(),
                            cash: 0,
                            bank: 0,
                            ota: 0,
                            by: new Types.ObjectId("6645b9b4cc6783129e3fa3e7"),
                            total: data.amount,
                            colId: data.txnId,
                            curDate: new Date(),
                            transaction: {
                                method: `TID-${data.deviceSerial}`,
                                isVerified: Boolean(successTransaction && successTransaction.status == "AUTHORIZED"),
                                txnId: data.txnId,
                                paymentMode: data.paymentMode
                            }
                        });
                        await booking.save();
                    }

                }

            }
        } catch (err) {
            console.log(err)
            console.log("RazorPay Error")
        }
        if (data.status == "AUTHORIZED") {
            return res.status(200).json({ status: true, message: "Payment Accepted Recorded successfully" })
        } else {
            return res.status(200).json({ status: true, message: "Payment Failure Recorded successfully" })
        }


    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }

}

export default acceptPosPaymentController;