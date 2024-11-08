import { Request, Response } from "express"
import getExtensionIdOfCall from "../../../utils/dialer/getExtensionIdOfCall"
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest"



const placeCallController = async (
    req: Request,
    res: Response
) => {

    try {

        const decodedData = (req as ManagerAuthRequest).decodedData
        const phoneNumber = Number(req.body.phoneNumber)
        return res.status(200).json({
            status: true,
            message: "Extension Created Successfully.",
            data: `${phoneNumber}`
        });

        // if(!decodedData.did){
        //     return res.status(400).json({
        //         status: false,
        //         message: "Please contact admin."
        //     })
        // }

        // if (!phoneNumber || isNaN(phoneNumber) || phoneNumber.toString().length != 10) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Please enter correct phone number."
        //     })
        // }



        // const eStatus = await getExtensionIdOfCall(
        //     phoneNumber,
        //     decodedData.did
        // )

        // if (!eStatus.status || !eStatus.extensionId) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Please try after some time."
        //     })
        // }
        // return res.status(200).json({
        //     status: true,
        //     message: "Extension Created Successfully.",
        //     data: `${decodedData.did},${eStatus.extensionId}`
        // })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time."
        })
    }

}

export default placeCallController