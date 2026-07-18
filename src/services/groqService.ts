import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

interface GenerateCardsParams {
  topic: string;
  subject: string;
  studyClass: string;
  difficulty: string;
  type: "flashcard" | "mcq";
  count: number;
}

const RATE_LIMIT_MESSAGE =
  "AI সার্ভিস এই মুহূর্তে ব্যস্ত (দৈনিক সীমা শেষ হয়ে গেছে)। কিছুক্ষণ পর আবার চেষ্টা করো।";
const GENERIC_AI_ERROR_MESSAGE = "AI সার্ভিসের সাথে সংযোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করো।";

/**
 * টপিক দিয়ে flashcard বা MCQ সেট জেনারেট করে (AI Content Generator ফিচার)
 * Groq কে structured JSON রিটার্ন করতে বলা হচ্ছে
 */
export const generateStudyCards = async ({
  topic,
  subject,
  studyClass,
  difficulty,
  type,
  count,
}: GenerateCardsParams) => {
  const formatInstruction =
    type === "mcq"
      ? `Each item must have: "question" (string), "options" (array of exactly 4 strings), "correctOptionIndex" (number 0-3), "answer" (string - explanation of the correct answer).`
      : `Each item must have: "question" (string - the front of the flashcard), "answer" (string - the back of the flashcard, a clear concise explanation).`;

  const systemPrompt = `You are an expert Bangladeshi curriculum tutor for ${studyClass} level students, subject: ${subject}. 
Generate exactly ${count} ${type === "mcq" ? "multiple choice questions" : "flashcards"} about the topic "${topic}" at ${difficulty} difficulty.
Respond ONLY with a valid JSON array, no markdown, no code fences, no preamble.
${formatInstruction}
Write questions and answers in Bangla (বাংলা) language, clear and student-friendly, matching Bangladesh HSC/SSC curriculum style.`;

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Topic: ${topic}` },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    });
  } catch (err: any) {
    if (err?.status === 429) {
      throw new Error(RATE_LIMIT_MESSAGE);
    }
    throw new Error(GENERIC_AI_ERROR_MESSAGE);
  }

  const raw = completion.choices[0]?.message?.content || "[]";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // fallback: try to extract JSON array from the text
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("AI থেকে সঠিক ফরম্যাটে ডেটা পাওয়া যায়নি, আবার চেষ্টা করুন");
  }
};

/**
 * AI Tutor চ্যাটের জন্য streaming response
 * res হলো Express Response object, যেখানে chunk by chunk লেখা হবে (SSE style)
 */
export const streamTutorChat = async (
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  onChunk: (chunk: string) => void
) => {
  const systemPrompt = {
    role: "system" as const,
    content: `You are "Porashona Sohayok AI Tutor", a friendly, patient tutor for Bangladeshi SSC/HSC students.
Answer in Bangla (বাংলা) unless the student writes in English.
Explain concepts step by step, use simple examples relevant to Bangladeshi students.
Keep answers focused and not too long. If a question is unclear, ask a clarifying follow-up.`,
  };

  let stream;
  try {
    stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [systemPrompt, ...messages],
      temperature: 0.6,
      max_tokens: 1500,
      stream: true,
    });
  } catch (err: any) {
    if (err?.status === 429) {
      throw new Error(RATE_LIMIT_MESSAGE);
    }
    throw new Error(GENERIC_AI_ERROR_MESSAGE);
  }

  let fullText = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      fullText += content;
      onChunk(content);
    }
  }
  return fullText;
};

/**
 * চ্যাট হিস্টোরির ওপর ভিত্তি করে ৩টা follow-up প্রশ্ন সাজেস্ট করে
 */
export const generateFollowUpSuggestions = async (
  lastUserMessage: string,
  lastAssistantMessage: string
): Promise<string[]> => {
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `Based on the conversation, suggest exactly 3 short follow-up questions (in Bangla, max 8 words each) a student might ask next. Respond ONLY as a JSON array of 3 strings, no markdown.`,
        },
        {
          role: "user",
          content: `Student asked: "${lastUserMessage}"\nTutor answered: "${lastAssistantMessage.slice(0, 500)}"`,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    const raw = completion.choices[0]?.message?.content || "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return ["আরও উদাহরণ দাও", "সহজ করে বলো", "এটা পরীক্ষায় কীভাবে আসে?"];
  }
};

export default groq;