import { Request, Response } from "express"
import Bookings, { CompletedBookings } from "../../../models/bookings/bookingModel"
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest"
import { bookingNotifierAsEvent } from "../../../notifiers/bookingNotifiers"
import BookingActions from "../../../utils/booking/bookingActions"
import MoneyFlow from "../../../utils/expense/soucesAndPartners/MoneyFlow"


const managerModifyAmount = async (
    req: Request,
    res: Response
) => {

    try {

        const amount = Number(req.body.amount)
        const cFee = Number(req.body.cFee)
        const bookingId = req.body.bookingId


        const decodedData = (req as ManagerAuthRequest).decodedData

        if (amount == undefined || cFee == undefined || isNaN(amount) || isNaN(cFee) || amount <= 0) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct amount."
            })
        }

        if (!bookingId) {
            return res
                .status(400)
                .json({ status: false, message: "Please enter correct bookingId" });
        }

        const booking = await Bookings.findOne({
            bookingId: bookingId,
        }).populate([{ path: "hotelId" }, { path: "userId" }])

        if (!booking) {
            return res
                .status(400)
                .json({ status: false, message: "Please enter correct bookingId" });
        }

        const permission = decodedData.permissions.find((perm) => perm.hotel.toString() == booking.hotelId._id.toString())

        if (
            !permission || (!permission.canModifyAmount)
        ) {
            return res
                .status(400)
                .json({ status: false, message: "You do not have access." });
        }

        if (booking.isCancelled || booking.hasNotShown) {
            return res.status(400).json({
                status: false,
                message: "Amount cannot be modified for this booking."
            })
        }

        if (booking.collections.find(it => Boolean(it.transaction))) {
            return res.status(400).json({
                status: false,
                message: "This booking cannot be modified."
            })
        }

        booking.amountModifications.push({
            from: {
                amount: booking.bookingAmount,
                convenienceFee: booking.convenienceAmount ? booking.convenienceAmount : 0
            },
            to: {
                amount: amount,
                convenienceFee: cFee > 0 ? cFee : 0
            },
            date: new Date(),
            by: decodedData._id
        })
        booking.bookingAmount = amount
        booking.convenienceAmount = cFee > 0 ? cFee : 0
        booking.isConveniencePayment = cFee > 0 ? true : false
        booking.deletedCollections = [
            ...booking.deletedCollections,
            ...booking.collections.map(col => {
                return {
                    ...col,
                    deletedBy: decodedData._id,
                    deletedDate: new Date()
                }
            })
        ]
        await MoneyFlow.DeleteBookingCollection(booking.collections.map(it => it.colId))
        booking.collections = []
        booking.amount = amount + (cFee > 0 ? cFee : 0) + booking.extraCharges.reduce((acc, cur) => acc + cur.revenueAmount, 0)
        await booking.save()
        return res.status(200).json({
            status: true,
            message: "Amount Modified Sucessfully.",
            data: await bookingNotifierAsEvent(booking, BookingActions.BillUpdated)
        })
    } catch (err) {
        console.log(err)
        return res.status(400).json({
            status: false,
            message: "Please try after some time."
        })
    }

}

export default managerModifyAmount