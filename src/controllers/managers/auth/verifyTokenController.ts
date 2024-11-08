import { Request, Response } from "express";
import ManagerAuthRequest from "../../../types/managers/ManagerAuthRequest";
import Manager from "../../../models/managers/managerSchema";

const verifyTokenController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const fcmToken: string | undefined = req.body.fcmToken;
    const decodedData = (req as ManagerAuthRequest).decodedData;

    if (fcmToken) {
      await Manager.updateOne({ _id: decodedData._id }, { fcmToken });
    }

    return res
      .status(200)
      .json({ status: true, message: "Token Saved Successfully.", data: decodedData.taskToken });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: true, message: "Please try after some time." });
  }
};


export default verifyTokenController