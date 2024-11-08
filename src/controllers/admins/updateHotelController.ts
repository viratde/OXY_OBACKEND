import { Request, Response } from "express";
import validateHotelReqData from "../../utils/admins/validateHotelData";

const adminUpdateHotelController = async (
  req: Request,
  res: Response
): Promise<Response> => {

  try {

    if(!req.query.hotelId){
        return res.status(400).json({status:false,message:"Please try after some time."})
    }

    const status = await validateHotelReqData(req,req.query.hotelId as string)

    if (!status.status) {
        return res.status(400).json({ status: false, message: status.message });
      }
  
      if (!status.data) {
        return res
          .status(400)
          .json({ status: false, message: "Please try after some time." });
      }
  
      return res
        .status(200)
        .json({ status: true, message: "hotel Updated Successfully",data:JSON.stringify(status.data) });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default adminUpdateHotelController