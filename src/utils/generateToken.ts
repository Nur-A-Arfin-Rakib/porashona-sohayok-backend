import jwt from "jsonwebtoken";
import { Response } from "express";

export const generateToken = (res: Response, userId: string) => {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};
