import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ExplainBody {
  questionText: string;
  options: { a: string; b: string; c: string; d: string };
  correctAnswer: string;
  domain: string;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { questionText, options, correctAnswer, domain } =
      (await request.json()) as ExplainBody;

    const correctLabel = options[correctAnswer as keyof typeof options];

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 700,
      system: `You are an expert NETA electrical testing instructor. Respond ONLY in this exact format — no preamble, no extra text, no blank lines between sections:

CORRECT: [2-3 sentences explaining why the correct answer is right. Use **standard name** to bold any cited standards such as **NETA MTS**, **IEEE**, **NFPA 70E**, **OSHA 1910**.]
WRONG_A: [2-3 sentences explaining why A is wrong. Omit this line entirely if A is the correct answer.]
WRONG_B: [2-3 sentences explaining why B is wrong. Omit this line entirely if B is the correct answer.]
WRONG_C: [2-3 sentences explaining why C is wrong. Omit this line entirely if C is the correct answer.]
WRONG_D: [2-3 sentences explaining why D is wrong. Omit this line entirely if D is the correct answer.]

Be concise and technical. Write at the level of a working journeyman electrical tester.`,
      messages: [
        {
          role: "user",
          content: `Question: ${questionText}\n\nA: ${options.a}\nB: ${options.b}\nC: ${options.c}\nD: ${options.d}\n\nCorrect answer: ${correctAnswer.toUpperCase()} — ${correctLabel}\nDomain: ${domain}`,
        },
      ],
    });

    const text =
      msg.content[0].type === "text" ? msg.content[0].text : "";
    return NextResponse.json({ explanation: text });
  } catch (err) {
    console.error("practice/explain error:", err);
    return NextResponse.json({ error: "Evaluation unavailable" }, { status: 500 });
  }
}
