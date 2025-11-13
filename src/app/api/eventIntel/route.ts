import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const body = await req.json();
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are Burnham, an event intelligence analyst." },
      { role: "user", content: body.prompt },
    ],
    max_tokens: 500,
  });

  return NextResponse.json({
    output: response.choices[0].message.content,
  });
}