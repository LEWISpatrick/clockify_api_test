import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Environment variable for OpenAI API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  const { report } = await req.json();

  // Prepare the prompt for OpenAI to generate LaTeX code
  const prompt = `
  Generate LaTeX code for the following report:
  
  ${report}
  `;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const latexCode = response.data.choices[0].message.content;
    return NextResponse.json({ latexCode });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
