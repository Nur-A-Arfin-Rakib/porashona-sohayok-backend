import express from "express";
import {
  registerUser,
  loginUser,
  demoLogin,
  googleLogin,
  getMe,
  logoutUser,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/demo-login", demoLogin);
router.post("/google", googleLogin);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);

export default router;
