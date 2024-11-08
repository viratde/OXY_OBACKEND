import { Request, Response } from "express"
import TaskRequester from "../../utils/task/TaskRequester"
import Manager from "../../models/managers/managerSchema"
import ManagerAuthRequest from "../../types/managers/ManagerAuthRequest"


const managerCreateUserController = async (
    req: Request,
    res: Response
) => {

    try {


        const decodedData = (req as ManagerAuthRequest).decodedData

        const email = req.body.email ? String(req.body.email) : undefined

        const name = req.body.name ? String(req.body.name) : undefined
        const phoneNo = req.body.phoneNo ? Number(req.body.phoneNo) : undefined
        const password = req.body.password ? String(req.body.password) : undefined


        if (!name || name.length < 3) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct name"
            })
        }

        if (!email || email.indexOf("@") == -1 || email.indexOf(".") == -1) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct email"
            })
        }

        if (!phoneNo || isNaN(phoneNo) || String(phoneNo).length != 12) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct phone no"
            })
        }

        if (!password || password.length < 8) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct password"
            })
        }


        const data = await TaskRequester(
            `${process.env.TASK_MANAGER_URL}/user`,
            process.env.TASK_MANAGER_TOKEN as string,
            req.body,
            "POST",
        );

        if (data && data.status && data.data && data.data.token) {

            let manager = await Manager.findOne({ email: email })

            if (manager) {
                manager.taskToken = data.data.token;
                await manager.save();
            } else {

                const nManager = new Manager({
                    username: email,
                    password: password,
                    name: name,
                    permissions: [],
                    phoneNumber: phoneNo,
                    phoneNumbers: [phoneNo],
                    email,
                    emails: [email],
                    reference: decodedData._id,
                    fcmToken: "",
                    taskToken: "",
                    did: ""
                })

                nManager.taskToken = data.data.token;
                await nManager.save();
            }
        }

        return res.status(200).json(data)

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }
}

export default managerCreateUserController