import axios, { AxiosError } from "axios"
import fs from "fs"
import FormData from "form-data"

const uploadMediaAndGetMediaId = async (
    filePath: string = `${__dirname}/media.mp4`,
    mediaType: string = "video/mp4",
) => {


    try {


        const formData = new FormData()

        formData.append("file", fs.createReadStream(filePath), { contentType: mediaType })
        formData.append("messaging_product", "whatsapp")
        formData.append("type", mediaType)

        const response = await axios.post(
            `${process.env.WA_API_ENDPOINT}/${process.env.WA_VERSION}/${process.env.WA_SELECTED_PHONE_NUMBER_ID}/media`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${process.env.WA_BEARER_TOKEN}`,
                    ...formData.getHeaders()
                }
            }
        )

        return response.data

    } catch (err) {
        console.log((err as AxiosError).response)
        return undefined
    }


}

export default uploadMediaAndGetMediaId