import express from "express";
import { getPlatformStats } from "../controllers/statsController";

const router = express.Router();

router.get("/", getPlatformStats);

export default router;
