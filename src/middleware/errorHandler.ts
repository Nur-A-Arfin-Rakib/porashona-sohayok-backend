import { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`রুট পাওয়া যায়নি - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 404;
    message = "রিসোর্স পাওয়া যায়নি";
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    statusCode = 400;
    message = "এই তথ্য দিয়ে আগে থেকেই একটা অ্যাকাউন্ট আছে";
  }

  // Multer file upload errors
  if (err.name === "MulterError") {
    statusCode = 400;
    if ((err as any).code === "LIMIT_FILE_SIZE") {
      message = "ছবির সাইজ সর্বোচ্চ 5MB হতে পারবে";
    } else {
      message = "ছবি আপলোড করতে সমস্যা হয়েছে";
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
