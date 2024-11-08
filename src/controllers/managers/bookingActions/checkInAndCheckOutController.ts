import { Request, Response } from "express";
import Bookings, { CompletedBookings } from "../../../models/bookings/bookingModel";
import Qr from "../../../utils/qr/decrypt";
import moment from "moment-timezone";
import IBooking from "../../../types/bookings/booking";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import codeGenerate from "../../../utils/common/codeGenerate";
import bookingNotifier from "../../../notifiers/bookingNotifiers";
import BookingActions from "../../../utils/booking/bookingActions";


const checkInAndCheckOutController = async (req: Request, res: Response): Promise<Response> => {

    try {

        let code = req.query.code;

        if (!code) {
            code = req.body.code
        }

        if (!code) {
            return res.status(400).json({ status: false, message: "Unknown Error" })
        }
        if (String(code).length == 6) {
            const booking = await Bookings.findOne({ actionCode: code }).populate([{ path: "hotelId" }, { path: "userId" }])
            return await actionHandler(booking, req, res, false)
        } else {
            let decodedData = JSON.parse(Qr.decryptQrData(code as string))
            let diff = moment(new Date()).tz("Asia/Kolkata").unix() - moment.tz(decodedData.issued_at, "DD-MM-YYYY HH:mm:ss", "Asia/Kolkata").unix()
            if (diff > 12) {
                return res.status(400).json({ status: false, message: "Qr Code Expired" })
            }
            const booking = await Bookings.findOne({ bookingId: decodedData.bookingId }).populate([{ path: "hotelId" }, { path: "userId" }])
            return await actionHandler(booking, req, res, true)
        }
        // return res
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: "Please try after some time." })
    }
}

async function actionHandler(
    booking: IBooking | null,
    req: Request,
    res: Response,
    isQr: boolean
): Promise<Response> {

    const decodedData = (req as ManagerAuthRequest).decodedData

    if (!booking) {
        return res.status(400).json({ status: false, message: "Booking Not Found" })
    }

    if (booking.hasNotShown) {
        return res.status(400).json({ status: false, message: "Booking has been already marked as no show." })
    }

    if (booking.isCancelled) {
        return res.status(400).json({ status: false, message: "Booking has been cancelled." })
    }

    let curdate = moment(new Date())

    if (!booking.hasCheckedIn) {

        const permission = decodedData.permissions.find(perm => perm.hotel.toString() == booking.hotelId._id.toString())
        if (!permission || !permission.canCheckInBooking) {
            return res.status(400).json({ status: false, message: "You do not have access." })
        }

        if (!((curdate.unix() >= moment(booking.actualCheckIn).unix()) && (curdate.unix() <= moment(booking.actualCheckOut).unix())) && permission.isTimeBounded) {
            return res.status(400).json({ status: false, message: "This booking cannot be checked in now." })
        }

        booking.hasCheckedIn = true
        booking.checkedInData = {
            date: curdate.toDate(),
            isQr: isQr,
            by: decodedData._id
        }
        booking.checkInTime = curdate.toDate()
        booking.actionCode = codeGenerate(6)
        await booking.save()
        bookingNotifier(booking, BookingActions.CheckedIn)
        return res.status(200).json({ status: true, message: "Checked In Successfully" })
    } else if (!booking.hasCheckedOut) {

        if (!booking.isRoomAssigned) {
            return res.status(400).json({ status: false, message: "Room has not been assigned to this booking." })
        }

        booking.hasCheckedOut = true
        booking.checkedOutData = {
            date: curdate.toDate(),
            isQr: isQr,
            by: decodedData._id
        }
        booking.checkOutTime = curdate.toDate()
        await booking.save()
        bookingNotifier(booking, BookingActions.CheckedOut)
        return res.status(200).json({ status: true, message: "Checked Out Successfully" })
    } else {
        return res.status(200).json({ status: true, message: "Booking already checked Out." })
    }
}


export default checkInAndCheckOutController