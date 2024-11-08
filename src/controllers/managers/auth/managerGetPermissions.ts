import { Request,Response } from "express";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import IHotel from "../../../types/hotels/hotel";
import { Document } from "mongoose";

const managerGetPermissionController = async (req:Request,res:Response) : Promise<Response> => {

    try{

        const decodedData = (req as ManagerAuthRequest).decodedData

        let data = (await decodedData.populate({
            path: "permissions.hotel",
            model:"Hotels"
        }));
        

        let mappedData = data.permissions.map(perm => {
            let newPerm = {...perm,...(perm.hotel as Document<IHotel>).toObject({transform:function (doc,ret){
                if(!ret.nearBy){
                  ret.nearBy = {}
                }
              }})}
            delete newPerm["hotel"]
            return newPerm
        })
        
        return res.status(200).json({status:true,message:"Hotel",data:mappedData})
    }catch(err){
        console.log(err)
        return res.status(500).json({status:false,message:"Please try after some time."})
    }

}

export default managerGetPermissionController