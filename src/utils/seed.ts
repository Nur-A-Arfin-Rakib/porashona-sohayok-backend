import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";
import Note from "../models/Note";

const sampleNotes = [
  {
    title: "নিউটনের গতিসূত্র - সহজ ব্যাখ্যা",
    shortDescription: "নিউটনের তিনটি গতিসূত্র উদাহরণসহ সংক্ষেপে বোঝানো হয়েছে।",
    fullDescription:
      "নিউটনের প্রথম সূত্র বলে, বাহ্যিক বল প্রয়োগ না করলে কোনো বস্তু তার স্থিতি বা সমবেগে সরলরৈখিক গতির অবস্থা বজায় রাখে। দ্বিতীয় সূত্র অনুযায়ী, বস্তুর ভরবেগের পরিবর্তনের হার প্রযুক্ত বলের সমানুপাতিক এবং বলের দিকে ক্রিয়াশীল হয় (F = ma)। তৃতীয় সূত্র বলে প্রতিটি ক্রিয়ার সমান ও বিপরীতমুখী প্রতিক্রিয়া থাকে। এই নোটে প্রতিটি সূত্রের বাস্তব জীবনের উদাহরণ, গাণিতিক প্রমাণ এবং সাধারণ ভুল ধারণাগুলো আলোচনা করা হয়েছে, যা HSC পদার্থবিজ্ঞান ১ম পত্রের জন্য গুরুত্বপূর্ণ।",
    subject: "Physics",
    studyClass: "HSC",
    chapter: "গতি ও বল",
    imageUrl: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800",
  },
  {
    title: "জৈব রসায়ন: হাইড্রোকার্বনের শ্রেণিবিভাগ",
    shortDescription: "অ্যালকেন, অ্যালকিন ও অ্যালকাইনের গঠন ও ধর্ম নিয়ে বিস্তারিত নোট।",
    fullDescription:
      "হাইড্রোকার্বন হলো এমন যৌগ যা শুধু কার্বন ও হাইড্রোজেন দ্বারা গঠিত। স্যাচুরেটেড হাইড্রোকার্বন (অ্যালকেন) এ কার্বন-কার্বন একক বন্ধন থাকে, আনস্যাচুরেটেড হাইড্রোকার্বনে (অ্যালকিন, অ্যালকাইন) দ্বি-বন্ধন বা ত্রি-বন্ধন থাকে। এই নোটে IUPAC নামকরণ পদ্ধতি, ভৌত ধর্ম, এবং প্রস্তুতি প্রণালী উদাহরণসহ দেওয়া আছে। SSC ও HSC উভয় লেভেলের শিক্ষার্থীদের জন্য উপযোগী।",
    subject: "Chemistry",
    studyClass: "HSC",
    chapter: "জৈব রসায়ন",
    imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800",
  },
  {
    title: "ত্রিকোণমিতিক অনুপাত ও সূত্রাবলি",
    shortDescription: "sin, cos, tan এর মৌলিক সূত্র ও সমস্যা সমাধানের কৌশল।",
    fullDescription:
      "ত্রিকোণমিতি গণিতের এমন একটি শাখা যেখানে ত্রিভুজের কোণ ও বাহুর মধ্যে সম্পর্ক নিয়ে আলোচনা করা হয়। এই নোটে sin, cos, tan, cot, sec, cosec এর সংজ্ঞা, পিথাগোরাসের উপপাদ্য থেকে যোগসূত্র, এবং কোণের রূপান্তর সূত্র ব্যাখ্যা করা হয়েছে। সাথে আছে ধাপে ধাপে সমাধানকৃত ৫টি উদাহরণ যা HSC উচ্চতর গণিত পরীক্ষায় বারবার আসে।",
    subject: "Higher Math",
    studyClass: "HSC",
    chapter: "ত্রিকোণমিতি",
    imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800",
  },
  {
    title: "কোষ বিভাজন: মাইটোসিস ও মিয়োসিস",
    shortDescription: "কোষ বিভাজনের ধাপগুলো চিত্রসহ সহজ ভাষায় বর্ণিত।",
    fullDescription:
      "মাইটোসিস কোষ বিভাজনে একটি মাতৃকোষ থেকে দুটি অভিন্ন অপত্য কোষ তৈরি হয়, যা দেহকোষের বৃদ্ধি ও মেরামতের জন্য দায়ী। মিয়োসিসে জননকোষ তৈরি হয় যেখানে ক্রোমোজোম সংখ্যা অর্ধেক হয়ে যায়। এই নোটে প্রোফেজ, মেটাফেজ, অ্যানাফেজ ও টেলোফেজ ধাপগুলো আলাদা আলাদাভাবে ব্যাখ্যা করা হয়েছে, সাথে দুটি প্রক্রিয়ার মধ্যে তুলনামূলক পার্থক্য সারণি আকারে দেওয়া আছে।",
    subject: "Biology",
    studyClass: "HSC",
    chapter: "কোষ বিভাজন",
    imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800",
  },
  {
    title: "English Grammar: Tense সহজে শেখা",
    shortDescription: "Present, Past ও Future Tense এর সব ধরনের গঠন ও ব্যবহার।",
    fullDescription:
      "Tense বাক্যের ক্রিয়াপদের কাল নির্দেশ করে। এই নোটে ১২টি tense-এর গঠন (structure), ব্যবহারের নিয়ম এবং প্রতিটির জন্য উদাহরণ বাক্য দেওয়া আছে। Present Indefinite থেকে Future Perfect Continuous পর্যন্ত প্রতিটি tense আলাদা সেকশনে টেবিল আকারে দেখানো হয়েছে, যা SSC ও HSC ইংরেজি ২য় পত্রের Grammar অংশের জন্য অত্যন্ত কার্যকর।",
    subject: "English",
    studyClass: "SSC",
    chapter: "Tense",
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
  },
  {
    title: "বাংলাদেশের মুক্তিযুদ্ধ: প্রেক্ষাপট ও ঘটনাপ্রবাহ",
    shortDescription: "১৯৭১ সালের মুক্তিযুদ্ধের প্রধান ঘটনাসমূহের সংক্ষিপ্ত টাইমলাইন।",
    fullDescription:
      "১৯৫২ সালের ভাষা আন্দোলন থেকে শুরু করে ১৯৭১ সালের ১৬ ডিসেম্বর বিজয় অর্জন পর্যন্ত সময়কালকে এই নোটে ধারাবাহিকভাবে সাজানো হয়েছে। ছয় দফা আন্দোলন, ৭ই মার্চের ভাষণ, অপারেশন সার্চলাইট এবং মুক্তিযুদ্ধের বিভিন্ন সেক্টর নিয়ে সংক্ষিপ্ত কিন্তু গুরুত্বপূর্ণ তথ্য দেওয়া আছে, যা SSC বাংলাদেশ ও বিশ্বপরিচয় বিষয়ের জন্য প্রয়োজনীয়।",
    subject: "Bangladesh Studies",
    studyClass: "SSC",
    chapter: "মুক্তিযুদ্ধ",
    imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
  },
];

const seed = async () => {
  await connectDB();

  const demoEmail = process.env.DEMO_EMAIL || "demo@porashonasohayok.com";
  let demoUser = await User.findOne({ email: demoEmail });
  if (!demoUser) {
    demoUser = await User.create({
      name: "Demo Student",
      email: demoEmail,
      password: process.env.DEMO_PASSWORD || "Demo@1234",
      studyClass: "HSC",
      provider: "local",
    });
    console.log("✅ Demo user তৈরি হয়েছে");
  }

  await Note.deleteMany({ author: demoUser._id });
  const notesToInsert = sampleNotes.map((n) => ({ ...n, author: demoUser!._id }));
  await Note.insertMany(notesToInsert);

  console.log(`✅ ${notesToInsert.length}টা স্যাম্পল নোট যোগ করা হয়েছে`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
