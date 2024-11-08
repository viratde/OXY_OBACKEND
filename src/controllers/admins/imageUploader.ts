import * as fs from "fs";
import { v4 as uuidV4 } from "uuid";
import { promisify } from "util";
import { Request, Response } from "express";

const mkdirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);

const uploadFile = async (
  file: Express.Multer.File
): Promise<{ [key: string]: string } | { error: string }> => {
  try {
    const resourceBasePath = `${__dirname.replace(
      "/src/controllers/admins",
      ""
    )}/public`;
    const uniqueId = uuidV4();
    const fileMimeType = file.mimetype.split("/");
    let folderPath = "hotelImages/img";

    if (!fileMimeType[0].startsWith("image")) {
      return { error: "Unsupported file type" };
    }

    const filePath = `${resourceBasePath}/${folderPath}/${uniqueId}.png`;

    await mkdirAsync(resourceBasePath + "/" + folderPath, { recursive: true });

    await writeFileAsync(filePath, file.buffer);

    const imageURL = `/${folderPath}/${uniqueId}.png`;

    let result: { [key: string]: string } = {};
    result[file.originalname] = imageURL;
    return result;
  } catch (err) {
    return { error: "Please try after some time." };
  }
};

const adminUploadMultipleImages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "No files were uploaded." });
    }

    const files : Express.Multer.File[] = (Array.isArray(req.files) ? [...req.files] : [req.files]) as Array<Express.Multer.File>;

    let uploadedImages: { [key: string]: string } = {};

    for (const file of files) {
      const result = await uploadFile(file);

      if ("error" in result) {
        console.error(`Error uploading file: ${result.error}`);
        return res
          .status(500)
          .json({ status: false, message: "No files were uploaded." });
      }

      uploadedImages = { ...uploadedImages, ...result };
    }
    return res.status(200).json({
      status: true,
      message: "Successfully Uploaded.",
      data: JSON.stringify(uploadedImages),
    });
  } catch (err) {
    console.error(`Error uploading files: ${err}`);
    return res.status(500).json({ status: false, message: "No files were uploaded." });
  }
};

export default adminUploadMultipleImages
