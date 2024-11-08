import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../../models/users/userModel";

const verifyOtpController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { otp, verifyToken } = req.body;

  try {
    if (!otp || isNaN(otp) || otp.length != 6) {
      return res
        .status(400)
        .json({ status: false, message: "Please Provide Correct Otp." });
    }
    if (!verifyToken) {
      return res.status(400).json({ status: false, message: "Unknown Error" });
    }

    const data = jwt.verify(verifyToken, process.env.JWT_TOKEN as string) as JwtPayload;

    if (!data || !data.otp || !data.data) {
      return res.status(400).json({ status: false, message: "Unknown Error" });
    }

    if (data.otp != otp) {
      return res
        .status(400)
        .json({ status: false, message: "Please Provide Correct Otp." });
    }
    let userData: { [key: string]: string } = {};

    if (data.data.includes("@")) {
      userData.email = data.data;
    } else {
      userData.phoneNumber = data.data;
    }

    let user = await User.findOne(userData);

    if (!user) {
      const verifiedToken = jwt.sign(
        { verifyToken: userData },
        process.env.JWT_TOKEN as string
      );
      return res
        .status(200)
        .json({
          status: true,
          message: "Verified Successfully",
          data: JSON.stringify({ verifiedToken, ...userData }),
        });
    } else {
      const authToken = jwt.sign(
        { authToken: user._id },
        process.env.JWT_TOKEN as string
      );
      return res
        .status(200)
        .json({
          status: true,
          message: "Authenticated Successfully",
          data: JSON.stringify({ authToken, ...(user.toObject()) }),
        });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};


export default verifyOtpController