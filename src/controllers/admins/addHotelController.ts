import validateHotelReqData from "../../utils/admins/validateHotelData";
import AdminAuthRequest from "../../types/admins/AdminAuthRequest";
import { Response, Request } from "express";

const addHotelController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const decodedData = (req as AdminAuthRequest).decodedData;

  try {
    let status =await validateHotelReqData(req, undefined);

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
      .json({ status: true, message: "hotel Added Successfully",data:JSON.stringify(status.data) });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time" });
  }
};

export default addHotelController;
