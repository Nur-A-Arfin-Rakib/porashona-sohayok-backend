import { Response } from "express";
import asyncHandler from "express-async-handler";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import { AuthRequest } from "../middleware/auth";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    নতুন ইউজার রেজিস্ট্রেশন
// @route   POST /api/auth/register
export const registerUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, studyClass } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("সব ফিল্ড পূরণ করুন");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("এই ইমেইল দিয়ে আগে থেকেই একাউন্ট আছে");
  }

  const user = await User.create({ name, email, password, studyClass, provider: "local" });
  const token = generateToken(res, user._id.toString());

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, studyClass: user.studyClass },
  });
});

// @desc    লগইন
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || user.provider !== "local" || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("ইমেইল বা পাসওয়ার্ড ভুল");
  }

  const token = generateToken(res, user._id.toString());
  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, studyClass: user.studyClass },
  });
});

// @desc    ডেমো লগইন (auto-fill থাকা ডেমো ক্রেডেনশিয়াল দিয়ে)
// @route   POST /api/auth/demo-login
export const demoLogin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const demoEmail = process.env.DEMO_EMAIL as string;
  const demoPassword = process.env.DEMO_PASSWORD as string;

  let user = await User.findOne({ email: demoEmail });
  if (!user) {
    user = await User.create({
      name: "Demo Student",
      email: demoEmail,
      password: demoPassword,
      studyClass: "HSC",
      provider: "local",
    });
  }

  const token = generateToken(res, user._id.toString());
  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, studyClass: user.studyClass },
  });
});

// @desc    Google Sign-In (frontend থেকে Google ID token আসবে)
// @route   POST /api/auth/google
export const googleLogin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(400);
    throw new Error("Google ID টোকেন দরকার");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    res.status(400);
    throw new Error("Google টোকেন যাচাই করা যায়নি");
  }

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      name: payload.name || "Google User",
      email: payload.email,
      avatar: payload.picture,
      provider: "google",
      googleId: payload.sub,
    });
  }

  const token = generateToken(res, user._id.toString());
  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, studyClass: user.studyClass },
  });
});

// @desc    বর্তমান ইউজারের প্রোফাইল
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ success: true, user: req.user });
});

// @desc    লগআউট
// @route   POST /api/auth/logout
export const logoutUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.clearCookie("token");
  res.json({ success: true, message: "লগআউট সফল হয়েছে" });
});
