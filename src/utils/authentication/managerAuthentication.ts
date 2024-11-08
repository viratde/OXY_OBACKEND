import { NextFunction, Request, Response } from "express";
import Manager from "../../models/managers/managerSchema";
import jwt from "jsonwebtoken";
import ManagerAuthRequest from "../../types/managers/ManagerAuthRequest";

const managerAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let bearerHeader = req.header("authorization");

    if (typeof bearerHeader == "undefined")
      return res
        .status(400)
        .json({ status: false, message: "Token is missing" });

    let bearerToken = bearerHeader.split(" ");
    let token = bearerToken[1];

    const data = jwt.verify(token, process.env.JWT_TOKEN as string);

    if (typeof data == "string") {
      return res
        .status(400)
        .json({ status: false, message: "Please login again." });
    }
    if (!data.managerId) {
      return res
        .status(400)
        .json({ status: false, message: "Please login again." });
    }

    const manager = await Manager.findOne({ _id: data.managerId });
    if (!manager) {
      return res
        .status(400)
        .json({ status: false, message: "Please login again." });
    }
    (req as ManagerAuthRequest).decodedData = manager;

    next();
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default managerAuthentication;
