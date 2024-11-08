import { Request, Response } from "express";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import Bookings from "../../../models/bookings/bookingModel";
import moment from "moment-timezone";
import { bookingNotifierAsEvent } from "../../../notifiers/bookingNotifiers";
import BookingActions from "../../../utils/booking/bookingActions";
import MoneyFlow from "../../../utils/expense/soucesAndPartners/MoneyFlow";

const managerDeleteCollectionController = async (
    req: Request,
    res: Response
) => {

    try {

        const decodedData = (req as ManagerAuthRequest).decodedData
        let bookingId = req.body.bookingId as string
        let collectionId = req.body.collectionId as string

        if (!bookingId) {
            return res
                .status(400)
                .json({ status: false, message: "Please enter correct bookingId" });
        }

        if (!collectionId) {
            return res
                .status(400)
                .json({ status: false, message: "Please enter correct collectionId" });
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
            !permission || !permission.canDeleteCollection
        ) {
            return res
                .status(400)
                .json({ status: false, message: "You do not have access." });
        }


        if (booking.hasNotShown) {
            return res.status(400).json({
                status: false,
                message: "Booking has been already marked as no show.",
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
                message: "Checked Out Bookings Collection Cannot be Deleted.",
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

        let isCollection = booking.collections.find((col) => {
            return col.colId === collectionId
        })

        if (!isCollection) {
            return res.status(400).json({
                status: false,
                message: "Collection Not Found."
            })
        }
        if (isCollection.transaction) {
            return res.status(400).json({
                status: false,
                message: "This transaction cannot be deleted."
            })
        }

        booking.collections = booking.collections.filter(col => {
            return col.colId != collectionId
        })
        booking.deletedCollections.push({ ...isCollection, deletedBy: decodedData._id, deletedDate: new Date() })
        await booking.save()
        await MoneyFlow.DeleteBookingCollection([collectionId])
        return res.status(200).json({
            status: true,
            message: "Collection Deleted Successfully.",
            data: await bookingNotifierAsEvent(booking, BookingActions.CollectionUpdated)
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time."
        })
    }

}

export default managerDeleteCollectionController