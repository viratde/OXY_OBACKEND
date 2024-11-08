import { Request, Response } from "express"
import ManagerAuthRequest from "../../types/managers/ManagerAuthRequest"
import TaskRequester from "../../utils/task/TaskRequester"
import TaskDataRequester from "../../utils/task/TaskDataRequester"


const managerGetCompanyController = async (
    req: Request,
    res: Response
) => {

    try {

        const count = req.params.count && Number(req.params.count) >= 10 ? Number(req.params.count) : 20
        const page = req.params.page && Number(req.params.page) >= 1 ? Number(req.params.page) : 1

        const data = await TaskDataRequester(
            `${process.env.TASK_MANAGER_URL}/company`,
            process.env.TASK_MANAGER_TOKEN as string,
            {},
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

export default managerGetCompanyController