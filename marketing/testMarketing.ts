import sendVideoMarketingTemplate from "./sendVideoMarketingTemplate"
import uploadMediaAndGetMediaId from "./uploadMediaAndGetMediaId"


const testMarketing = async () => {


    const mediaId = "976215154218443"


    const response = await sendVideoMarketingTemplate(
        mediaId,
        "917000637319"
    )

    console.log(response)
}

export default testMarketing