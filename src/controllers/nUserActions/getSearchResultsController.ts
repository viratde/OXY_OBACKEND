import { Request, Response } from "express";
import getSearchResults from "../../utils/nUserActions/getSearchResults";



const getSearchResultsController = async (
    req: Request,
    res: Response
) => {

    try {

        const text = req.query.text as string
        const lat = Number(req.query.lat)
        const lng = Number(req.query.lng)

        if (!text) {
            return res.status(400).json({ status: false, message: "Please enter correct location" })
        }

        const data = await getSearchResults(text, (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : undefined)
       
        return res.status(200).json({
            status:true,
            message:"Searched Successfully",
            data:data
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }

}

export default getSearchResultsController