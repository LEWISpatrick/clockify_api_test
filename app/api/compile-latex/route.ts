import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Function to compile LaTeX code into PDF
export async function POST(req: NextRequest) {
  const { latexCode } = await req.json();

  try {
    // Send the LaTeX code to a LaTeX compiler service
    const response = await axios.post(
      "https://latex.codecogs.com/api/latex",
      {
        latex: latexCode,
        output: "pdf",
      },
      {
        responseType: "arraybuffer", // Important for binary data
      }
    );

    // Return the PDF blob
    return new Response(response.data, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=report.pdf",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
