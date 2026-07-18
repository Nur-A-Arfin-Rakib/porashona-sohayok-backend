import mongoose, { Schema, Document } from "mongoose";

export interface IRating {
  user: mongoose.Types.ObjectId;
  value: number;
  comment?: string;
  createdAt: Date;
}

export interface INote extends Document {
  title: string;
  shortDescription: string;
  fullDescription: string;
  subject: string;
  studyClass: "SSC" | "HSC";
  chapter: string;
  imageUrl: string;
  additionalImages: string[];
  fileUrl?: string;
  author: mongoose.Types.ObjectId;
  ratings: IRating[];
  averageRating: number;
  views: number;
  upvotes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 200 },
    fullDescription: { type: String, required: true },
    subject: { type: String, required: true, trim: true },
    studyClass: { type: String, enum: ["SSC", "HSC"], required: true },
    chapter: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    additionalImages: { type: [String], default: [] },
    fileUrl: { type: String },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ratings: [ratingSchema],
    averageRating: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

noteSchema.index({ title: "text", subject: "text", chapter: "text" });

noteSchema.methods.recalculateAverage = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc: number, r: IRating) => acc + r.value, 0);
    this.averageRating = Number((sum / this.ratings.length).toFixed(1));
  }
};

export default mongoose.model<INote>("Note", noteSchema);
