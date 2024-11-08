import axios from "axios"

const getExtensionIdOfCall = async (
    phoneNumber: Number,
    did:string
) => {

    try {


        const extensionId = Math.floor(1000 + Math.random() * 9000);

        const response = await axios({
            method: "POST",
            url: "https://backend.pbx.bonvoice.com/insert_extension_entries/",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Token 0c3a9f1ffc20a0694939ae8c1e321a85bccd2735"
            },
            data: {
                data: [
                    {
                        extension: extensionId.toString(),
                        contact: phoneNumber.toString()
                    }
                ],
                did:did
            }
        })

        if(response.data.responseCode == 200){
            return {
                status: true,
                extensionId:extensionId
            }
        }else{
            return {
                status: false,
            }
        }

    } catch (err) {
        console.log(err)
        return {
            status: false
        }
    }


}

export default getExtensionIdOfCall