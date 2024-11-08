import { Request, Response } from "express";


const processWebhookController = async (
    req: Request,
    res: Response
) => {
    try {

        console.log(req.body, req.params, req.query)
        return res.status(200).json({ status: true })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }
}

export default processWebhookController