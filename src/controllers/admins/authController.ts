import { Request, Response } from "express";
import Admin from "../../models/admins/adminSchema";
import jwt from "jsonwebtoken"

const adminAuthController = async (
  req: Request,
  res: Response
): Promise<Response> => {


  try {

    const { username, password } = req.body;

  
    if (!username || !password) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct ceredential" });
    }

    const admin = await Admin.findOne({
      username: username,
      password: password,
    });

    if (!admin) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct ceredential" });
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_TOKEN as string) ;

    return res.status(200).json({
      status: true,
      message: "Authenticated Successfully",
      data: token,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      message: "Please try after some time",
    });
  }


};

export default adminAuthController
