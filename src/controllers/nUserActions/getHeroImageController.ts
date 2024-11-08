import { Request, Response } from "express";


const getHeroImageController = async (
    req:Request,
    res:Response
) => {
    try {
        
        return res.status(200).download(`${process.cwd()}/public/assets/hero.webp`)

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time"
        })
    }
}

export default getHeroImageController