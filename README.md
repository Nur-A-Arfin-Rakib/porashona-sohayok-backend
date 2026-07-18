# পড়াশোনা সহায়ক - Backend API

HSC ও SSC শিক্ষার্থীদের জন্য AI-চালিত স্টাডি প্ল্যাটফর্ম "পড়াশোনা সহায়ক"-এর ব্যাকএন্ড সার্ভার। এই API নোট শেয়ারিং, AI ফ্ল্যাশকার্ড/MCQ জেনারেশন এবং AI টিউটর চ্যাট ফিচারের জন্য প্রয়োজনীয় সব endpoint সরবরাহ করে।

## প্রযুক্তি ব্যবহৃত হয়েছে

- Node.js + Express.js
- TypeScript
- MongoDB (Mongoose ODM)
- JWT ও Google OAuth 2.0 - Authentication
- Groq AI (Llama 3.3 70B) - AI Content Generation ও Chat
- Cloudinary - ছবি আপলোড ও স্টোরেজ

## মূল ফিচারসমূহ

### Authentication
- ইমেইল/পাসওয়ার্ড দিয়ে রেজিস্ট্রেশন ও লগইন (JWT ভিত্তিক)
- Google দিয়ে Social Login
- ডেমো অ্যাকাউন্ট লগইন

### নোট শেয়ারিং সিস্টেম
- নোট আপলোড (ছবি, ফাইল লিংকসহ)
- ক্লাস ও সাবজেক্ট অনুযায়ী ফিল্টারিং, সার্চ ও সর্টিং
- আপভোট ও স্টার রেটিং/রিভিউ সিস্টেম
- সম্পর্কিত নোট সাজেশন

### AI ফিচার
- AI Content Generator: যেকোনো টপিক দিয়ে ফ্ল্যাশকার্ড বা MCQ জেনারেট করা
- AI Chat Assistant: স্ট্রিমিং রেসপন্সসহ AI টিউটর, ফলো-আপ প্রশ্ন সাজেস্ট করে

## API রুট সমূহ

- /api/auth - রেজিস্ট্রেশন, লগইন, Google OAuth
- /api/notes - নোট CRUD, ফিল্টার, রেটিং, আপভোট
- /api/ai - ফ্ল্যাশকার্ড/MCQ জেনারেশন, AI টিউটর চ্যাট
- /api/upload - Cloudinary ছবি আপলোড
- /api/stats - প্ল্যাটফর্ম স্ট্যাটিস্টিক্স

## ইনস্টলেশন ও রান

```bash
npm install
npm run dev
```

সার্ভার ডিফল্টভাবে http://localhost:5000 এ চালু হবে।

## ডেভেলপার

Nur A Arfin
