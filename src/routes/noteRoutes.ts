import express from "express";
import {
  getNotes,
  getNoteById,
  createNote,
  getMyNotes,
  deleteNote,
  rateNote,
  toggleUpvote,
} from "../controllers/noteController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.get("/", getNotes);
router.get("/mine/all", protect, getMyNotes);
router.get("/:id", getNoteById);
router.post("/", protect, createNote);
router.delete("/:id", protect, deleteNote);
router.post("/:id/rate", protect, rateNote);
router.post("/:id/upvote", protect, toggleUpvote);

export default router;
