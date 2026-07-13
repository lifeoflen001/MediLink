import { Router } from "express";
import OpenAI from "openai";
import { logger } from "../lib/logger.js";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are MediConnect AI, a helpful and compassionate healthcare assistant serving patients across Africa. Your role is to help users:
- Find information about medicines (dosage, usage, side effects, storage, precautions)
- Understand symptoms and assess urgency (mild, urgent, emergency)
- Navigate to nearby pharmacies and healthcare services
- Understand prescriptions in simple language
- Make informed healthcare decisions

CRITICAL GUIDELINES:
1. NEVER provide definitive medical diagnoses
2. For emergency symptoms (severe chest pain, difficulty breathing, stroke signs, severe bleeding), immediately say "THIS REQUIRES EMERGENCY CARE - Call emergency services NOW (999 or 1199)"
3. For urgent symptoms, recommend visiting a healthcare provider soon
4. For mild symptoms, provide general guidance and suggest a pharmacy visit if medication is needed
5. Always encourage professional medical consultation for serious conditions
6. Be culturally sensitive and appropriate for African healthcare contexts
7. Respond in the same language the user writes in (English or Swahili supported)
8. Keep responses clear, concise, and actionable
9. For medicine questions, always include: purpose, dosage guidance, key precautions, and when to seek help
10. Remind users that information is general guidance and they should consult a pharmacist or doctor`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

router.post("/chat", async (req, res) => {
  const { messages } = req.body as { messages: ChatMessage[] };

  if (!Array.isArray(messages)) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-20), // Keep last 20 messages for context
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: unknown) {
    logger.error({ error }, "AI chat error");
    // Forward the OpenAI error code so the client can show a tailored message
    let errorMessage = "Failed to get AI response. Please try again.";
    if (
      error &&
      typeof error === "object" &&
      "error" in error &&
      error.error &&
      typeof error.error === "object" &&
      "message" in error.error
    ) {
      errorMessage = String((error.error as { message: string }).message);
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

export default router;
