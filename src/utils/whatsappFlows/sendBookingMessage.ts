import axios, { AxiosError } from "axios"
import moment from "moment-timezone"
import Hotel from "../../models/hotels/hotelModel"


const sendBookingTemplateMessage = async (
    PHONE_NUMBER: string,
    SELECTED_PHONE_NUMBER_ID: string,
    ACCESS_TOKEN: string
) => {

    try {

        const hotelData = (await Hotel.find({isHotelListed:true})).map(hot => {
            return {
                id: hot._id,
                title: hot.hotelName.toUpperCase(),
                description: hot.hotelAddress,
                metadata: `₹${hot.minPrice}`
            }
        })



        let checkInTime = moment().tz("Asia/Kolkata").startOf("day").add(1,"day")

        const response = await axios({
            method: "post",
            url: `https://graph.facebook.com/v18.0/${SELECTED_PHONE_NUMBER_ID}/messages`,
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            data: {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": PHONE_NUMBER,
                "type": "interactive",
                "interactive": {
                    "type": "flow",
                    "header": {
                        "type": "text",
                        "text": "Welcome to Oxyhotels"
                    },
                    "body": {
                        "text": "Did you know that we've got 2.5 Crore bookings since March 2020? And this is all thanks to the sanitisation & safety measures followed at our properties, from disinfecting surfaces with high-quality cleaning products and maintaining social distance to using protective gear and more."
                    },
                    "footer": {
                        "text": "Oxyhotels"
                    },
                    "action": {
                        "name": "flow",
                        "parameters": {
                            "flow_message_version": "3",
                            "flow_token": `book_hotels_roomAQAAAAACS5FpgQ_cAAAAAD0QI3`,
                            "flow_id": "966075331528771",
                            "flow_cta": "Book!",
                            "flow_action": "navigate",
                            "flow_action_payload": {
                                "screen": "BOOKING_SCREEN",
                                "data": {
                                    "all_burgers": hotelData,
                                    "min_check_in_date": `${checkInTime.unix() * 1000 - 24 * 60 * 60 * 1000}`,
                                    "min_check_out_date": `${checkInTime.clone().add(1, "day").unix() * 1000 - 24 * 60 * 60 * 1000}`
                                }
                            }
                        }
                    }
                }
            }
        })
        return response.data
    } catch (err) {
        console.log((err as AxiosError).response?.data)
        return false
    }
}



export default sendBookingTemplateMessage