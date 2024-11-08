import { Request, Response } from "express"
import TaskDataRequester from "../../utils/task/TaskDataRequester"
import TaskRequester from "../../utils/task/TaskRequester"


const managerCreateCompanyController = async (
    req: Request,
    res: Response
) => {

    try {


        const data = await TaskRequester(
            `${process.env.TASK_MANAGER_URL}/company`,
            process.env.TASK_MANAGER_TOKEN as string,
            req.body,
            "POST",
        )

        return res.status(200).json(data)

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }
}

export default managerCreateCompanyController