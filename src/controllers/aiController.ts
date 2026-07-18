import { Response } from "express";
import asyncHandler from "express-async-handler";
import FlashcardSet from "../models/FlashcardSet";
import ChatSession from "../models/ChatSession";
import { AuthRequest } from "../middleware/auth";
import { generateStudyCards, streamTutorChat, generateFollowUpSuggestions } from "../services/groqService";

// @desc    টপিক দিয়ে flashcard/MCQ সেট জেনারেট ও সেভ করা
// @route   POST /api/ai/generate-cards
export const generateCards = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { topic, subject, studyClass, difficulty = "Medium", type = "flashcard", count = 5 } = req.body;

  if (!topic || !subject || !studyClass) {
    res.status(400);
    throw new Error("টপিক, সাবজেক্ট এবং ক্লাস দিতে হবে");
  }

  let cards;
  try {
    cards = await generateStudyCards({
      topic,
      subject,
      studyClass,
      difficulty,
      type,
      count: Math.min(Number(count), 20),
    });
  } catch (err: any) {
    res.status(err.message?.includes("ব্যস্ত") ? 429 : 500);
    throw err;
  }

  const set = await FlashcardSet.create({
    user: req.user!._id,
    topic,
    subject,
    studyClass,
    difficulty,
    type,
    cards,
  });

  res.status(201).json({ success: true, set });
});

// @desc    ইউজারের সব flashcard/MCQ সেট
// @route   GET /api/ai/my-sets
export const getMySets = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sets = await FlashcardSet.find({ user: req.user!._id }).sort("-createdAt");
  res.json({ success: true, sets });
});

// @desc    একটা সেট ডিলিট
// @route   DELETE /api/ai/sets/:id
export const deleteSet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const set = await FlashcardSet.findOne({ _id: req.params.id, user: req.user!._id });
  if (!set) {
    res.status(404);
    throw new Error("সেট পাওয়া যায়নি");
  }
  await set.deleteOne();
  res.json({ success: true, message: "ডিলিট হয়ে গেছে" });
});

// @desc    ইউজারের সব চ্যাট সেশন
// @route   GET /api/ai/chats
export const getChatSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sessions = await ChatSession.find({ user: req.user!._id })
    .select("title createdAt updatedAt")
    .sort("-updatedAt");
  res.json({ success: true, sessions });
});

// @desc    একটা চ্যাট সেশনের পুরো হিস্টোরি
// @route   GET /api/ai/chats/:id
export const getChatSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await ChatSession.findOne({ _id: req.params.id, user: req.user!._id });
  if (!session) {
    res.status(404);
    throw new Error("চ্যাট সেশন পাওয়া যায়নি");
  }
  res.json({ success: true, session });
});

// @desc    AI Tutor কে মেসেজ পাঠানো (Server-Sent Events দিয়ে স্ট্রিমিং)
// @route   POST /api/ai/chat/:sessionId?
export const sendChatMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { message } = req.body;
  const { sessionId } = req.params;

  if (!message?.trim()) {
    res.status(400);
    throw new Error("মেসেজ খালি রাখা যাবে না");
  }

  let session = sessionId
    ? await ChatSession.findOne({ _id: sessionId, user: req.user!._id })
    : null;

  if (!session) {
    session = await ChatSession.create({
      user: req.user!._id,
      title: message.slice(0, 40),
      messages: [],
    });
  }

  session.messages.push({ role: "user", content: message, createdAt: new Date() });

  // SSE হেডার সেটআপ
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Session-Id", session._id.toString());
  res.flushHeaders();

  const history = session.messages.slice(-10).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const fullReply = await streamTutorChat(history, (chunk) => {
      res.write(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`);
    });

    session.messages.push({ role: "assistant", content: fullReply, createdAt: new Date() });
    await session.save();

    const suggestions = await generateFollowUpSuggestions(message, fullReply);

    res.write(
      `data: ${JSON.stringify({ type: "done", sessionId: session._id, suggestions })}\n\n`
    );
    res.end();
  } catch (error: any) {
    res.write(
      `data: ${JSON.stringify({ type: "error", message: error?.message || "AI রেসপন্স আনতে সমস্যা হয়েছে" })}\n\n`
    );
    res.end();
  }
});

// @desc    চ্যাট সেশন ডিলিট
// @route   DELETE /api/ai/chats/:id
export const deleteChatSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await ChatSession.findOne({ _id: req.params.id, user: req.user!._id });
  if (!session) {
    res.status(404);
    throw new Error("সেশন পাওয়া যায়নি");
  }
  await session.deleteOne();
  res.json({ success: true, message: "ডিলিট হয়ে গেছে" });
});