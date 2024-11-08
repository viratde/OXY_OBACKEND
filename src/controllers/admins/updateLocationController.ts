import { Request, Response } from "express"
import Location from "../../models/admins/locationSchema"
import { isValidObjectId } from "mongoose"


const updateLocationController = async (
    req: Request,
    res: Response
) => {


    try {

        const { latitude, longitude, distance, name, _id } = req.body

        if (!latitude || isNaN(Number(latitude))) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct latitude"
            })
        }

        if (!longitude || isNaN(Number(longitude))) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct longitude"
            })
        }

        if (!distance || isNaN(Number(distance))) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct distance"
            })
        }

        if (!name || name.length < 3) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct city name"
            })
        }

        const location = isValidObjectId(_id) ?  await Location.findOne({ _id: _id }) : undefined
        if (location) {

            location.latitude = Number(latitude)
            location.longitude = Number(longitude)
            location.locationName = name
            location.distance = parseInt(distance)

            await location.save()

            return res.status(200).json({
                status: true,
                message: "Location updated successfully.",
                data: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    name: location.locationName,
                    distance: location.distance,
                    _id: location._id.toString()
                }
            })
        } else {
            const location = await Location.create({
                latitude: Number(latitude),
                longitude: Number(longitude),
                locationName: name,
                distance: Number(distance)
            })

            return res.status(200).json({
                status: true,
                message: "Location updated successfully.",
                data: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    name: location.locationName,
                    distance: location.distance,
                    _id: location._id.toString()
                }
            })
        }


    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time."
        })
    }
}

export default updateLocationController