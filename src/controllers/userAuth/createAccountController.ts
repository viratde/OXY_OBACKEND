import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../../models/users/userModel";

const createAccountControlller = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {

    const { name, email, phone, dob, verifiedToken } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct name" });
    }

    if (!email || !email.includes("@")) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct email" });
    }
    if (!phone || (phone.length != 10 && phone.length != 12)) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct phone " });
    }

    if (!dob || dob.length != 10) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct dob" });
    }
    if (!verifiedToken) {
      return res
        .status(400)
        .json({
          status: false,
          message: "Please enter correct verification token",
        });
    }
    const data = jwt.verify(verifiedToken, process.env.JWT_TOKEN as string) as JwtPayload;
    const userData = data.verifyToken;

    if (!userData) {
      return res
        .status(400)
        .json({
          status: false,
          message: "Please enter correct verification token",
        });
    }
    if (userData.email && userData.email != email) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct email" });
    }


    if (userData.phone && userData.phone != phone) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct phone number" });
    }

    const user = await User.create({
      name,
      email,
      phoneNumber: phone.length == 10 ? `91${phone}` : phone,
      dob: dob,
    });
    const authToken = jwt.sign({ authToken: user._id }, process.env.JWT_TOKEN as string);
    return res
      .status(200)
      .json({
        status: true,
        message: "Authenticated Successfully",
        data: JSON.stringify({ authToken, ...(user.toObject()) }),
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default createAccountControlller