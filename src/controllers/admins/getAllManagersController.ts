import { Request, Response } from "express";
import Manager from "../../models/managers/managerSchema";


const getAllManagersController = async (
    req: Request,
    res: Response
) => {

    try {


        const managers = await Manager.find()

        return res.status(200).json({
            status: true,
            message: "Managers Updated Successfully",
            data: managers
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time."
        })
    }

}

export default getAllManagersController