import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../../models/users/userModel";

const verifyTokenController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { authToken, fToken } = req.body;

  try {
    if (!authToken) {
      return res
        .status(500)
        .json({ status: false, message: "Token Not Found" });
    }
    const data = jwt.verify(authToken, process.env.JWT_TOKEN as string) as JwtPayload;
    const user = await User.findOne({ _id: data.authToken });

    if (!user) {
      return res.status(500).json({ status: false, message: "Token Expired" });
    }
    if (fToken) {
      user.fcmToken = fToken;
      await user.save();
    }

    return res
      .status(200)
      .json({ status: true, message: "Logged In Successfully", data: "1.1.1" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default verifyTokenController;
