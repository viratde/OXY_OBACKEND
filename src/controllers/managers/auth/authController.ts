import { Request, Response } from "express";
import Manager from "../../../models/managers/managerSchema";
import jwt from "jsonwebtoken";

const managerAuthController = async (
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

    const manager = await Manager.findOne({
      username: username,
      password: password,
    })

    if (!manager) {
      return res
        .status(400)
        .json({ status: false, message: "Please enter correct ceredential" });
    }

    const token = jwt.sign(
      { managerId: manager._id },
      process.env.JWT_TOKEN as string
    );

    return res.status(200).json({
      status: true,
      message: "Authenticated Successfully",
      data: token,
      taskToken:manager.taskToken
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default managerAuthController;
