import axios, { AxiosError } from "axios"



const sendVideoMarketingTemplate = async (
    mediaId: string,
    phoneNumber: string
) => {

    try {

        const data = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phoneNumber,
            type: "template",
            template: {
                name: "video_marketing",
                language: {
                    code: "en"
                },
                components: [
                    {
                        "type": "HEADER",
                        "parameters": [
                            {
                                "type": "video",
                                "video": {
                                    "id": mediaId
                                }
                            }
                        ]
                    }
                ]
            }
        }

        const response = await axios.post(
            `${process.env.WA_API_ENDPOINT}/${process.env.WA_VERSION}/${process.env.WA_SELECTED_PHONE_NUMBER_ID}/messages`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${process.env.WA_BEARER_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        )

        return response.data

    } catch (err) {
        console.log((err as AxiosError).response)
        return undefined
    }

}

export default sendVideoMarketingTemplate