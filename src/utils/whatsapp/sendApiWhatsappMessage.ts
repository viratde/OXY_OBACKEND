

import axios, { AxiosError } from "axios";
import IBooking from "../../types/bookings/booking";
import IHotel from "../../types/hotels/hotel";
import moment from "moment";
import util from "util"

const sendCheckInCodeMessage = async (
    booking: IBooking
) => {

    const url = `${process.env.WA_API_ENDPOINT}/${process.env.WA_VERSION}/${process.env.WA_SELECTED_PHONE_NUMBER_ID}/messages`;

    const data = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: booking.phoneNumber,
        type: "template",
        template: {
            name: "booking_check_in",
            language: {
                code: "en_US"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: (booking.hotelId as IHotel).hotelName
                        },
                        {
                            type: "text",
                            text: moment.tz(booking.checkIn, (booking.hotelId as IHotel).timezone).format("DD-MM-YYYY hh:mm A")
                        },
                        {
                            type: "text",
                            text: moment.tz(booking.checkOut, (booking.hotelId as IHotel).timezone).format("DD-MM-YYYY hh:mm A")
                        },
                        {
                            type: "text",
                            text: Object.keys(booking.bookedRooms).reduce(
                                (acc, cur) => {
                                    return acc + booking.bookedRooms[cur].length
                                },
                                0
                            ).toString()
                        },
                        {
                            type: "text",
                            text: Object.keys(booking.bookedRooms)
                                .map((value) => booking.bookedRooms[value])
                                .flat()
                                .reduce((acc, cur) => acc + cur, 0).toString()
                        },
                        {
                            type: "text",
                            text: booking.actionCode
                        },
                        {
                            type: "text",
                            text: `https://api.oxyhotels.com/api/getBookingTicket/${booking.actionCode}`
                        },
                        {
                            type: "text",
                            text: (booking.hotelId as IHotel).phoneNo
                        },
                    ]
                }
            ],
        }
    }

    try {
        const resp = await axios({
            url: url,
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.WA_BEARER_TOKEN}`,
                "Content-Type": "application/json"
            },
            data: data
        })
        return resp.data
    } catch (err) {
        console.log((err as AxiosError).response?.data)
    }
}

const sendCheckOutCodeMessage = async (booking: IBooking) => {


    const url = `${process.env.WA_API_ENDPOINT}/${process.env.WA_VERSION}/${process.env.WA_SELECTED_PHONE_NUMBER_ID}/messages`;

    const data = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: booking.phoneNumber,
        type: "template",
        template: {
            name: "booking_check_out",
            language: {
                code: "en_US"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: (booking.hotelId as IHotel).hotelName
                        },
                        {
                            type: "text",
                            text: booking.actionCode
                        },
                        {
                            type: "text",
                            text: `https://api.oxyhotels.com/api/getBookingTicket/${booking.actionCode}`
                        },
                        {
                            type: "text",
                            text: (booking.hotelId as IHotel).phoneNo
                        },
                    ]
                }
            ],
        }
    }

    try {
        const res = await axios({
            url: url,
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.WA_BEARER_TOKEN}`,
                "Content-Type": "application/json"
            },
            data: data
        })
        return res.data
    } catch (err) {
        console.log((err as AxiosError).response?.data)
    }

}

const sendAPIWhatsappTemplateMessage = {
    sendCheckInCodeMessage,
    sendCheckOutCodeMessage
}

export default sendAPIWhatsappTemplateMessage