import { Request,Response } from "express";
import User from "../../../models/users/userModel";

const managerGetUserData = async (req:Request,res:Response) : Promise<Response> => {

    try{

        const phone = req.body?.phone;


        if (!phone || phone.toString().length != 10 ) {
            return res.status(400).json({ status: false, message: "Please Enter Correct Phone Number" })
        }
        const user = await User.findOne({ phoneNumber: `91${phone}` })

        if (!user) {
            return res.status(200).json({ status: true, message:"User Not Found",data: JSON.stringify({ name: "", email: "" }) });
        }

        return res.status(200).json({ status: true, message: "success", data: JSON.stringify({ name: user.name, email: user.email }) });

    }catch(err){
        console.log(err)
        return res.status(500).json({status:false,message:"Please try after some time."})
    }

}

export default managerGetUserData