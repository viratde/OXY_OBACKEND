import { Request, Response } from "express"
import TaskDataRequester from "../../utils/task/TaskDataRequester"


const managerGetUsersController = async (
    req:Request,
    res:Response
) => { 

    try {

        const count = req.params.count && Number(req.params.count) >= 10 ? Number(req.params.count) : 20
        const page = req.params.page && Number(req.params.page) >= 1 ? Number(req.params.page) : 1

        const data = await TaskDataRequester(
            `${process.env.TASK_MANAGER_URL}/company/users`,
            process.env.TASK_MANAGER_TOKEN as string,
            req.query,
            "GET",
            count,
            page
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

export default managerGetUsersController