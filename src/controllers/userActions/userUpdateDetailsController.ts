import { Request, Response } from "express";
import UserAuthRequest from "../../types/users/userAuthRequest";
import User from "../../models/users/userModel";

const updateUserDetailsController = async (req: Request, res: Response) :Promise<Response> => {
  try {
    const decodedData = (req as UserAuthRequest).decodedData;
    const data = req.body;

    const user = await User.findOne({ _id: decodedData._id });

    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "Please login again." });
    }

    if (data.name) {
      user.name = data.name;
    }
    if (data.dob) {
      user.dob = data.dob;
    }

    if (data.email && !user.email) {
      user.email = data.email;
    }
    if (data.phone && !user.phoneNumber) {
      user.phoneNumber = data.phone;
    }
    await user.save();

    return res.status(200).json({ status: true, message: "Updated Successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }
};

export default updateUserDetailsController;
