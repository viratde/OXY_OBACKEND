import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../models/users/userModel";
import verifyGoogleCode from "../../utils/auth/verifyGoogleCode";

const verifyGoogleCodeController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const code = req.body.code;
  try {
   
    const payload = await verifyGoogleCode(code);

    if (!payload || !payload.email || !payload.email_verified) {
      return res
        .status(500)
        .json({ status: false, message: "Please verify your email." });
    }

    let userData = {
      name: payload.name,
      email: payload.email,
    };

    let user = await User.findOne({ email: userData.email });
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
      .json({ status: false, message: "Please try after some time" });
  }
};

export default verifyGoogleCodeController