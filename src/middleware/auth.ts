import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User, { IUser } from "../models/User";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401);
      throw new Error("অনুমতি নেই, লগইন করুন");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(401);
        throw new Error("এই ইউজার আর নেই");
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401);
      throw new Error("টোকেন সঠিক নয়, আবার লগইন করুন");
    }
  }
);
