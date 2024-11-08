import { Request, Response } from "express";
import Location from "../../models/admins/locationSchema";


const getAllLocationController = async (
    req: Request,
    res: Response
) => {

    try {


        const locations = await Location.find()

        return res.status(200).json({
            status: true,
            message: "Managers Updated Successfully",
            data: locations.map(a => {
                return {
                    latitude: a.latitude,
                    longitude: a.longitude,
                    distance: a.distance,
                    name: a.locationName,
                    _id: a._id.toString()
                }
            })
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time."
        })
    }

}

export default getAllLocationController