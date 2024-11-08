import { Request, Response } from "express";
import util from "util"
import Bookings from "../../models/bookings/bookingModel";
import sendBookingTemplateMessage from "../../utils/whatsappFlows/sendBookingMessage";
import createBookingMessage from "../../utils/whatsappFlows/createBookingMessage";

const processWhatsappMessageController = async (
    req: Request,
    res: Response
) => {

    try {

        const data: any = req.body

        const entries: { changes: any[] }[] = data.entry
        const changes: { value: { messages?: any[], contacts: { profile: { name: string }, wa_id: string }[] }, field: string }[] = entries.map(a => a.changes).flat()

        for (let i = 0; i < changes.length; i++) {

            const change = changes[i]

            if (change.field == "messages" && change.value.messages) {

                const messages: { type: string, text?: { body: string }, interactive?: { nfm_reply?: { response_json?: string } } }[] = change.value.messages

                for (let j = 0; j < messages.length; j++) {

                    const message = messages[j]



                    if (message.type == "text") {
                        let messageText = message.text?.body?.toLowerCase()
                        if (messageText && messageText.indexOf("book") != -1) {
                            await sendBookingTemplateMessage(
                                change.value.contacts[0].wa_id,
                                process.env.WA_SELECTED_PHONE_NUMBER_ID as string,
                                process.env.WA_BEARER_TOKEN as string,
                            )
                        }
                    } else if (message.type == "interactive" && message.interactive && message.interactive.nfm_reply && message.interactive.nfm_reply.response_json) {

                        const actualData = JSON.parse(message.interactive.nfm_reply.response_json)

                        if (actualData.flow_token == "booking_feedback") {

                            const check_in_experience = Number(actualData.check_in_experience)
                            const staff_frendiliness = Number(actualData.staff_frendiliness)
                            const amenities_provided = Number(actualData.amenities_provided)
                            const room_ceanliness = Number(actualData.room_ceanliness)
                            const room_comfort = Number(actualData.room_comfort)
                            const suggestion = String(actualData.suggestion)
                            const bookingId = String(actualData.bookingId)
                            if (
                                !isNaN(check_in_experience) &&
                                !isNaN(staff_frendiliness) &&
                                !isNaN(amenities_provided) &&
                                !isNaN(room_ceanliness) &&
                                !isNaN(room_comfort) &&
                                suggestion &&
                                bookingId
                            ) {

                                const booking = await Bookings.findOne({ bookingId })
                                if (booking) {
                                    booking.feedback = {
                                        staff_frendiliness,
                                        check_in_experience,
                                        room_ceanliness,
                                        room_comfort,
                                        amenities_provided,
                                        suggestion,
                                        date: new Date()
                                    }
                                    await booking.save()
                                }

                            }

                        } else if (actualData.flow_token.startsWith("book_hotels")) {
                            createBookingMessage(
                                actualData,
                                change.value.contacts[0].wa_id
                            )
                        }

                    }

                }

            }

        }
        return res.status(200).json({ status: true })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }

}

export default processWhatsappMessageController