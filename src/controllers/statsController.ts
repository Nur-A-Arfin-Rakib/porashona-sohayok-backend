import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Note from "../models/Note";
import User from "../models/User";
import ChatSession from "../models/ChatSession";
import FlashcardSet from "../models/FlashcardSet";

// @desc    হোমপেজের জন্য প্ল্যাটফর্মের রিয়েল স্ট্যাটিস্টিক্স
// @route   GET /api/stats
export const getPlatformStats = asyncHandler(async (req: Request, res: Response) => {
  const [noteCount, userCount, chatCount, cardAgg] = await Promise.all([
    Note.countDocuments(),
    User.countDocuments(),
    ChatSession.countDocuments(),
    FlashcardSet.aggregate([
      { $project: { cardCount: { $size: "$cards" } } },
      { $group: { _id: null, total: { $sum: "$cardCount" } } },
    ]),
  ]);

  res.json({
    success: true,
    stats: {
      noteCount,
      userCount,
      chatCount,
      flashcardCount: cardAgg[0]?.total || 0,
    },
  });
});
