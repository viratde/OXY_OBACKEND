import { Request, Response } from "express";
import Manager from "../../models/managers/managerSchema";
import sendFcmMessage from "../../utils/fcm/sender";


const managerHandleNotifications = async (
    req: Request,
    res: Response
) => {


    try {


        if (req.query.token === process.env.FCM_TASK_TOKEN) {
            const data: { email: string }[] = req.body.action
            const task : {id:string} = req.body.task

            for (let i = 0; i < data.length; i++) {

                const manager = await Manager.findOne({ email: data[i].email })

                if (!manager || !manager.fcmToken) {
                    continue
                }
                await sendFcmMessage.sendMessage(
                    {
                        eventType: "TASK_TOKEN",
                        action: JSON.stringify(data[i]),
                        taskId:task.id,
                        task:JSON.stringify(task)
                    },
                    manager.fcmToken
                )

            }
        }

        return res.status(200).json({ status: true, message: "Recorded Successfuly." })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }

}

export default managerHandleNotifications
