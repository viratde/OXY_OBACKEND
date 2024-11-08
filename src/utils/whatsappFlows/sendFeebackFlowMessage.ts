import axios from "axios"

const sendFeedbackFlowMessage = async (
    PHONE_NUMBER: string,
    SELECTED_PHONE_NUMBER_ID: string,
    ACCESS_TOKEN: string,
    bookingId: string
) => {

    try {


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
                "type": "template",
                "template": {
                    "name": "feedback_template",
                    "language": {
                        "code": "en_US"
                    },
                    "components": [
                        {
                            "type": "button",
                            "sub_type": "flow",
                            "index": "0",
                            "parameters": [
                                {
                                    "type": "action",
                                    "action": {
                                        "flow_token": "booking_feedback",   //optional, default is "unused"
                                        "flow_action_data": {
                                            "star_rating": [
                                                {
                                                    "id": "1",
                                                    "title": "Poor",
                                                    "metadata": "⭐"
                                                },
                                                {
                                                    "id": "2",
                                                    "title": "Fair",
                                                    "metadata": "⭐⭐"
                                                },
                                                {
                                                    "id": "3",
                                                    "title": "Average",
                                                    "metadata": "⭐⭐⭐"
                                                },
                                                {
                                                    "id": "4",
                                                    "title": "Good",
                                                    "metadata": "⭐⭐⭐⭐"
                                                },
                                                {
                                                    "id": "5",
                                                    "title": "Excellent",
                                                    "metadata": "⭐⭐⭐⭐⭐"
                                                }
                                            ],
                                            "bookingId": bookingId
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
            }
        })
        return response.data
    } catch (err) {
        return false
    }
}



export default sendFeedbackFlowMessage