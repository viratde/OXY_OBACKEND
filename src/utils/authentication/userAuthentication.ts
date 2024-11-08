import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../models/users/userModel";
import UserAuthRequest from "../../types/users/userAuthRequest";

const userAuthentication = async (
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
    if (!data.authToken) {
      return res
        .status(400)
        .json({ status: false, message: "Please login again." });
    }

    const user = await User.findOne({ _id: data.authToken });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "Please login again." });
    }
    (req as UserAuthRequest).decodedData = user;

    next();
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default userAuthentication;
