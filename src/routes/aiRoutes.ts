import express from "express";
import {
  generateCards,
  getMySets,
  deleteSet,
  getChatSessions,
  getChatSession,
  sendChatMessage,
  deleteChatSession,
} from "../controllers/aiController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.use(protect);

// Flashcard / MCQ generator
router.post("/generate-cards", generateCards);
router.get("/my-sets", getMySets);
router.delete("/sets/:id", deleteSet);

// AI Tutor chat
router.get("/chats", getChatSessions);
router.get("/chats/:id", getChatSession);
router.delete("/chats/:id", deleteChatSession);
router.post("/chat/:sessionId?", sendChatMessage);

export default router;
