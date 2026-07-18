import { Response } from "express";
import asyncHandler from "express-async-handler";
import Note from "../models/Note";
import { AuthRequest } from "../middleware/auth";

// @desc    সব নোট লিস্ট (search, filter, sort, pagination সহ)
// @route   GET /api/notes
export const getNotes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    search,
    subject,
    studyClass,
    sort = "-createdAt",
    page = 1,
    limit = 8,
  } = req.query;

  const query: any = {};

  if (search) {
    query.$text = { $search: search as string };
  }
  if (subject) {
    query.subject = subject;
  }
  if (studyClass) {
    query.studyClass = studyClass;
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const sortMap: Record<string, string> = {
    newest: "-createdAt",
    oldest: "createdAt",
    rating: "-averageRating",
    popular: "-views",
  };
  const sortOption = sortMap[sort as string] || (sort as string);

  const [notes, total] = await Promise.all([
    Note.find(query)
      .populate("author", "name avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Note.countDocuments(query),
  ]);

  res.json({
    success: true,
    notes,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
});

// @desc    একটা নোটের ডিটেইলস
// @route   GET /api/notes/:id
export const getNoteById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const note = await Note.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate("author", "name avatar")
    .populate("ratings.user", "name avatar");

  if (!note) {
    res.status(404);
    throw new Error("নোট পাওয়া যায়নি");
  }

  const relatedNotes = await Note.find({
    _id: { $ne: note._id },
    subject: note.subject,
  })
    .limit(4)
    .select("title imageUrl shortDescription averageRating studyClass");

  res.json({ success: true, note, relatedNotes });
});

// @desc    নতুন নোট আপলোড
// @route   POST /api/notes
export const createNote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, shortDescription, fullDescription, subject, studyClass, chapter, imageUrl, additionalImages, fileUrl } =
    req.body;

  if (!title || !shortDescription || !fullDescription || !subject || !studyClass || !chapter) {
    res.status(400);
    throw new Error("সব প্রয়োজনীয় ফিল্ড পূরণ করুন");
  }

  const cleanedExtraImages: string[] = Array.isArray(additionalImages)
    ? additionalImages.filter((url: string) => typeof url === "string" && url.trim().length > 0).slice(0, 6)
    : [];

  const note = await Note.create({
    title,
    shortDescription,
    fullDescription,
    subject,
    studyClass,
    chapter,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800",
    additionalImages: cleanedExtraImages,
    fileUrl,
    author: req.user!._id,
  });

  res.status(201).json({ success: true, note });
});

// @desc    ইউজারের নিজের আপলোড করা নোট
// @route   GET /api/notes/mine/all
export const getMyNotes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notes = await Note.find({ author: req.user!._id }).sort("-createdAt");
  res.json({ success: true, notes });
});

// @desc    নোট ডিলিট
// @route   DELETE /api/notes/:id
export const deleteNote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error("নোট পাওয়া যায়নি");
  }
  if (note.author.toString() !== req.user!._id.toString()) {
    res.status(403);
    throw new Error("এই নোট ডিলিট করার অনুমতি নেই");
  }
  await note.deleteOne();
  res.json({ success: true, message: "নোট ডিলিট হয়ে গেছে" });
});

// @desc    রেটিং/রিভিউ দেওয়া
// @route   POST /api/notes/:id/rate
export const rateNote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { value, comment } = req.body;
  const note = await Note.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error("নোট পাওয়া যায়নি");
  }

  const existing = note.ratings.find((r) => r.user.toString() === req.user!._id.toString());
  if (existing) {
    existing.value = value;
    existing.comment = comment;
  } else {
    note.ratings.push({ user: req.user!._id, value, comment, createdAt: new Date() } as any);
  }

  (note as any).recalculateAverage();
  await note.save();

  res.json({ success: true, note });
});

// @desc    আপভোট টগল করা
// @route   POST /api/notes/:id/upvote
export const toggleUpvote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error("নোট পাওয়া যায়নি");
  }

  const userId = req.user!._id.toString();
  const index = note.upvotes.findIndex((id) => id.toString() === userId);
  if (index > -1) {
    note.upvotes.splice(index, 1);
  } else {
    note.upvotes.push(req.user!._id);
  }
  await note.save();

  res.json({ success: true, upvoteCount: note.upvotes.length, upvoted: index === -1 });
});
