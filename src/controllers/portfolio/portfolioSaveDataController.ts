import { Request, Response } from "express";
import sendEmailPortfolio from "../../utils/portfolio/sendEmailPortFolio";


const portfolioSaveDataController = async (
    req: Request,
    res: Response
) => {


    try {

        const hotelName = req.body.hotelName
        const ownerName = req.body.ownerName
        const gst = req.body.gst
        const location = req.body.location
        const receptionPhone = req.body.receptionPhone
        const ownerPhone = req.body.ownerPhone
        const email = req.body.email
        const minPriceRange = req.body.minpriceRange
        const maxPriceRange = req.body.maxpriceRange
        const category = req.body.category
        const numOfRooms = req.body.numRooms
        const currentLocation = req.body.currentLocation

        const files: Express.Multer.File[] = req.files as Express.Multer.File[]


        await sendEmailPortfolio(
            "oxyitsolutions@gmail.com",
            files.map(it => { return { filename: `${it.fieldname}-${it.originalname}`, content: it.buffer,contentType:it.mimetype } }),
            [
                {
                    key: "Hotel Name",
                    value: hotelName
                },
                {
                    key: "Owner Name",
                    value: ownerName
                },
                {
                    key: "Gst",
                    value: gst
                },
                {
                    key: "Location",
                    value: location
                },
                {
                    key: "Reception Phone",
                    value: receptionPhone
                },
                {
                    key: "Owner Phone",
                    value: ownerPhone
                },
                {
                    key: "Email",
                    value: email
                },
                {
                    key: "Minimum Price",
                    value: minPriceRange
                },
                {
                    key: "Maximum Price",
                    value: maxPriceRange
                },
                {
                    key: "Category",
                    value: category
                },
                {
                    key: "No Of Rooms",
                    value: numOfRooms
                },
                {
                    key: "Current Location",
                    value: currentLocation
                },
            ],
            hotelName
        )

        return res.status(200).json({
            status: true,
            message: "Data Saved Successfully"
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }

}

export default portfolioSaveDataController