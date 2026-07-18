import mongoose, { Schema, Document } from "mongoose";

export interface ICard {
  question: string;
  answer: string;
  options?: string[];
  correctOptionIndex?: number;
}

export interface IFlashcardSet extends Document {
  user: mongoose.Types.ObjectId;
  topic: string;
  subject: string;
  studyClass: "SSC" | "HSC";
  difficulty: "Easy" | "Medium" | "Hard";
  type: "flashcard" | "mcq";
  cards: ICard[];
  createdAt: Date;
}

const cardSchema = new Schema<ICard>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    options: [{ type: String }],
    correctOptionIndex: { type: Number },
  },
  { _id: false }
);

const flashcardSetSchema = new Schema<IFlashcardSet>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    studyClass: { type: String, enum: ["SSC", "HSC"], required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    type: { type: String, enum: ["flashcard", "mcq"], default: "flashcard" },
    cards: [cardSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IFlashcardSet>("FlashcardSet", flashcardSetSchema);
