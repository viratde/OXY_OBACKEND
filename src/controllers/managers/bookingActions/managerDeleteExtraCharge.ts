import { Request, Response } from "express";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import Bookings from "../../../models/bookings/bookingModel";
import moment from "moment-timezone";
import { bookingNotifierAsEvent } from "../../../notifiers/bookingNotifiers";
import BookingActions from "../../../utils/booking/bookingActions";
import { ExtraChargeTypes } from "../../../types/bookings/ExtraCharge";
import MoneyFlow from "../../../utils/expense/soucesAndPartners/MoneyFlow";

const managerDeleteExtraChargeController = async (
    req: Request,
    res: Response
) => {

    try {

        const decodedData = (req as ManagerAuthRequest).decodedData
        let bookingId = req.body.bookingId as string
        let ecId = req.body.ecId as string

        if (!bookingId) {
            return res
                .status(400)
                .json({ status: false, message: "Please enter correct bookingId" });
        }

        if (!ecId) {
            return res
                .status(400)
                .json({ status: false, message: "Please enter correct extra charge Id." });
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
            !permission || !permission.canDeleteExtraCharge
        ) {
            return res
                .status(400)
                .json({ status: false, message: "You do not have access." });
        }


        if (booking.hasNotShown) {
            return res.status(400).json({
                status: false,
                message: "Booking has already marked as no show.",
            });
        }

        if (booking.isCancelled) {
            return res.status(400).json({
                status: false,
                message: "Booking has already marked as cancelled.",
            });
        }

        if (booking.hasCheckedOut && permission.isTimeBounded) {
            return res.status(400).json({
                status: false,
                message: "Checked Out Bookings Extra Charge Cannot be Deleted.",
            });
        }

        if (!booking.hasCheckedIn) {
            return res.status(400).json({
                status: false,
                message: "Booking has not been checked in yet.",
            });
        }

        let curdate = moment(new Date())

        if (!((curdate.unix() >= moment(booking.actualCheckIn).unix()) && (curdate.unix() <= moment(booking.actualCheckOut).unix())) && permission.isTimeBounded) {
            return res.status(400).json({ status: false, message: "This bookings collection cannot be deleted now." })
        }

        let isExtraCharge = booking.extraCharges.find(ex => ex.ecId === ecId)


        if (!isExtraCharge) {
            return res.status(400).json({
                status: false,
                message: "Extra Charge Not Found."
            })
        }

        if (booking.collections.find(it => Boolean(it.transaction))) {
            return res.status(400).json({
                status: false,
                message: "This Extra charge cannot be deleted as it is already paid."
            })
        }

        if (isExtraCharge.type == ExtraChargeTypes.EarlyCheckIn && isExtraCharge.extendedTime) {
            booking.actualCheckIn = moment(booking.actualCheckIn).add(isExtraCharge.extendedTime, "minutes").toDate()
        } else if (isExtraCharge.type == ExtraChargeTypes.LateCheckOut && isExtraCharge.extendedTime) {
            booking.actualCheckOut = moment(booking.actualCheckOut).subtract(isExtraCharge.extendedTime!, "minutes").toDate()
        }

        booking.extraCharges = booking.extraCharges.filter(ecr => {
            return ecr.ecId != ecId
        })
        await MoneyFlow.DeleteBookingCollection(booking.collections.map(it => it.colId))
        booking.collections = []
        booking.deletedExtraCharges.push({ ...isExtraCharge, deletedBy: decodedData._id, deletedDate: new Date() })
        booking.deletedCollections = [...booking.deletedCollections, ...booking.collections.map(col => {
            return { ...col, deletedBy: decodedData._id, deletedDate: new Date() }
        })]
        booking.amount = booking.amount + ((booking.convenienceAmount && booking.convenienceAmount > 0 ? booking.convenienceAmount : 0)) + booking.extraCharges.filter(ecr => {
            return ecr.ecId != ecId
        }).reduce((acc, cur) => acc + cur.revenueAmount, 0)
        await booking.save()
        return res.status(200).json({
            status: true,
            message: "Extra Charge Deleted Successfully.",
            data: await bookingNotifierAsEvent(booking, BookingActions.BillUpdated)
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time."
        })
    }

}

export default managerDeleteExtraChargeController