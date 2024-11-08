import { Request, Response } from "express";



const verifyWhatsappTokenController = async (
    req:Request,
    res:Response
) => {


    try {
        

        if(req.query["hub.verify_token"] == process.env.WA_CALLBACK_VERIFY_TOKEN){
            return res.status(200).send(req.query["hub.challenge"])
        }else{
            return res.status(400).json({status:false})
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }

}

export default verifyWhatsappTokenController