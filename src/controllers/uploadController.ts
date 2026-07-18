import { Response } from "express";
import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary";
import { AuthRequest } from "../middleware/auth";

// @desc    ছবি আপলোড (Cloudinary-তে)
// @route   POST /api/upload/image
export const uploadImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400);
    throw new Error("কোনো ছবি পাওয়া যায়নি");
  }

  const uploadFromBuffer = (): Promise<{ secure_url: string }> =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "porashona-sohayok/notes",
          resource_type: "image",
          transformation: [{ width: 1600, crop: "limit" }, { quality: "auto" }],
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result as { secure_url: string });
        }
      );
      stream.end(req.file!.buffer);
    });

  const result = await uploadFromBuffer();

  res.status(201).json({ success: true, url: result.secure_url });
});
