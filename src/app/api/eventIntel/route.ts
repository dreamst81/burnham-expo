import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // make sure we're in Node, not edge

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Burnham, an event intelligence analyst.",
        },
        { role: "user", content: body.prompt },
      ],
      max_tokens: 500,
    });

    const output = response.choices[0]?.message?.content || "";

    return NextResponse.json({ output });
  } catch (err: any) {
    console.error("Event intel error:", err);
    return NextResponse.json(
      { error: "Failed to generate intel" },
      { status: 500 }
    );
  }
}