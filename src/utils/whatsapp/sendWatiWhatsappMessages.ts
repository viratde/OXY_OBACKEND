const BearerToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzOWUzMTJkMC1lZGQzLTRjZWUtYmYzOS04M2YzM2RkMjQ3NzQiLCJ1bmlxdWVfbmFtZSI6InNlcnZpY2VAb3h5aG90ZWxzLmluIiwibmFtZWlkIjoic2VydmljZUBveHlob3RlbHMuaW4iLCJlbWFpbCI6InNlcnZpY2VAb3h5aG90ZWxzLmluIiwiYXV0aF90aW1lIjoiMTAvMDUvMjAyMyAwNzowODoyMSIsImRiX25hbWUiOiJtdC1wcm9kLVRlbmFudHMiLCJ0ZW5hbnRfaWQiOiIyMDAxMzMiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBRE1JTklTVFJBVE9SIiwiZXhwIjoyNTM0MDIzMDA4MDAsImlzcyI6IkNsYXJlX0FJIiwiYXVkIjoiQ2xhcmVfQUkifQ.FKRP35-tmHFLGDtTwpI_ValOa2y8uOr5Yd5P3rhu-jw"
const API_END_POINT = "https://live-mt-server.wati.io/200133"

import axios from "axios";
import IBooking from "../../types/bookings/booking";
import IHotel from "../../types/hotels/hotel";
import moment from "moment";

const sendCheckInCodeMessage = async (
    booking: IBooking
) => {
    const url = `${API_END_POINT}/api/v1/sendTemplateMessage?whatsappNumber=${booking.phoneNumber}`;

    try {
        await axios({
            url: url,
            method: "POST",
            headers: {
                "Authorization": BearerToken
            },
            data: {
                template_name: 'booking_check_in',
                broadcast_name: 'Check In Code',
                parameters: [
                    { name: "1", value: (booking.hotelId as IHotel).hotelName },
                    { name: "2", value: moment.tz(booking.checkIn, (booking.hotelId as IHotel).timezone).format("DD-MM-YYYY hh:mm A") },
                    { name: "3", value: moment.tz(booking.checkOut, (booking.hotelId as IHotel).timezone).format("DD-MM-YYYY hh:mm A") },
                    {
                        name: "4", value: Object.keys(booking.bookedRooms).reduce(
                            (acc, cur) => acc + booking.bookedRooms[cur].length,
                            0
                        ).toString()
                    },
                    {
                        name: "5", value: Object.keys(booking.bookedRooms)
                            .map((value) => booking.bookedRooms[value])
                            .flat()
                            .reduce((acc, cur) => acc + cur, 0).toString()
                    },
                    { name: "6", value: booking.actionCode },
                    { name: "7", value: `https://api.oxyhotels.com/api/getBookingTicket/${booking.actionCode}` },
                    { name: "8", value: (booking.hotelId as IHotel).phoneNo },
                ]
            }
        })
        return
    } catch (err) {
        console.log(err)
    }
}

const sendCheckOutCodeMessage = async (booking: IBooking) => {

    const url = `${API_END_POINT}/api/v1/sendTemplateMessage?whatsappNumber=${booking.phoneNumber}`;

    try {
        await axios({
            url: url,
            method: "POST",
            headers: {
                "Authorization": BearerToken
            },
            data: {
                template_name: 'booking_check_out',
                broadcast_name: 'Check In Code',
                parameters: [
                    { name: "1", value: (booking.hotelId as IHotel).hotelName },
                    { name: "2", value: booking.actionCode },
                    { name: "3", value: `https://api.oxyhotels.com/api/getBookingTicket/${booking.actionCode}` },
                    { name: "4", value: (booking.hotelId as IHotel).phoneNo }
                ]
            }
        })
        return
    } catch (err) {
        console.log(err)
    }

}

const sendOtpWatiMessage = async (phoneNumber: string, otp: string) => {
    const url = `${API_END_POINT}/api/v1/sendTemplateMessage?whatsappNumber=${phoneNumber}`;
    try {
        const resp = await axios({
            url: url,
            method: "POST",
            headers: {
                "Authorization": BearerToken
            },
            data: {
                template_name: 'phone_verification',
                broadcast_name: 'OTP_VERIFICATION',
                parameters: [
                    { name: "1", value: otp }
                ]
            }
        })
        console.log(resp.data)
        return
    } catch (err) {
        console.log(err)
    }
}

const sendWhatsappTemplateMessage = {
    sendCheckInCodeMessage,
    sendCheckOutCodeMessage,
    sendOtpWatiMessage
}

export default sendWhatsappTemplateMessage