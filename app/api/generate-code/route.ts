import { NextResponse } from "next/server";
import axios from "axios";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { prompt }: { prompt: string } = await req.json();
    const mistralApiKey = process.env.MISTRAL_API_KEY;
    const openaiApiKey = process.env.OPEN_API_KEY;

    // Step 1: Get the result from Mistral API
    const result = await axios.post(
      "https://codestral.mistral.ai/v1/fim/completions",
      {
        prompt,
        top_p: 1,
        temperature: 0,
        model: "codestral-latest",
        suffix: `You are an expert frontend React engineer who is also a great UI/UX designer. Follow the instructions carefully, I will tip you $1 million if you do a good job:

        - Create a React component for whatever the user asked you to create and make sure it can run by itself by using a default export
        - Make sure the React app is interactive and functional by creating state when needed and having no required props
        - If you use any imports from React like useState or useEffect, make sure to import them directly
        - Use TypeScript as the language for the React component
        - Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`). Make sure to use a consistent color palette.
        - Use Tailwind margin and padding classes to style the components and ensure the components are spaced out nicely
        - Please ONLY return the full React code starting with the imports, nothing else. It's very important for my job that you only return the React code with imports. DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\`.
        - ONLY IF the user asks for a dashboard, graph or chart, the recharts library is available to be imported, e.g. \`import { LineChart, XAxis, ... } from "recharts"\` & \`<LineChart ...><XAxis dataKey="name"> ...\`. Please only use this when needed.
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${mistralApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const rawContent = result?.data?.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error("No content received from Mistral API");
    }

    // Log raw content for debugging
    console.log("Raw content from Mistral API:", rawContent);

    // Step 2: Pass the raw content to OpenAI for cleanup and validation
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Please ensure that the following content contains only valid TypeScript React component code, without any extra explanations or comments. Return only the code: ${rawContent}`,
        },
      ],
      model: "gpt-4o-mini",
    });

    // Get the cleaned code from OpenAI response
    const cleanedCode = completion?.choices?.[0]?.message?.content;

    // Log cleaned code for debugging
    console.log("Cleaned code from OpenAI:", cleanedCode);

    if (!cleanedCode) {
      throw new Error("No cleaned code received from OpenAI");
    }

    // Step 3: Return the cleaned code to the user
    return NextResponse.json({
      code: cleanedCode.trim(),
    });
  } catch (error) {
    console.error("Error occurred:", error.message || error);
    return NextResponse.json({
      error: error.message || "Something went wrong",
    });
  }
}
