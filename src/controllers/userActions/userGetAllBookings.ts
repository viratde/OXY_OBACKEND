import { Request,Response } from "express";
import UserAuthRequest from "../../types/users/userAuthRequest";
import Bookings from "../../models/bookings/bookingModel";
import bookingUserFormatter from "../../utils/booking/bookingUserFormatter";
import bookingPopulate from "../../utils/booking/populateData";

const getAllBookingsController =async (req:Request,res:Response) : Promise<Response> => {

    try{

        const decodedData = (req as UserAuthRequest).decodedData
        let bookings = await Bookings.find({ userId: decodedData._id }, "hotelId amount bookingAmount checkIn checkOut isCancelled hasCheckedIn hasCheckedOut bookingId hasNotShown bookedRooms _id").populate(bookingPopulate)
        return res.status(200).json({ status: true, message: "Booking Synced Successfuly.", data: JSON.stringify(bookings.map(booking => bookingUserFormatter(booking))) })

    }catch(err){
        console.log(err)
        return res.status(500).json({status:false,message:"Please try after some time."})
    }

}

export default getAllBookingsController