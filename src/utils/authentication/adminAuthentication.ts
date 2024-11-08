import { NextFunction, Request, Response } from "express";
import Admin from "../../models/admins/adminSchema";
import jwt from "jsonwebtoken";
import AdminAuthRequest from "../../types/admins/AdminAuthRequest";

const adminAuthentication = async (
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
    if (!data.adminId) {
      return res
        .status(400)
        .json({ status: false, message: "Please login again." });
    }

    const admin = await Admin.findOne({ _id: data.adminId });
    if (!admin) {
      return res
        .status(400)
        .json({ status: false, message: "Please login again." });
    }
    (req as AdminAuthRequest).decodedData = admin;
    
    next();
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default adminAuthentication;
