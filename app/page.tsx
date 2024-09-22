"use client";

import React, { useState } from "react";
import { OpenAI } from "openai";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Message {
  role: "user" | "system";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "Welcome! You can ask me to generate charts." },
  ]);
  const [input, setInput] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string>("");

  const handleSendMessage = async () => {
    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");

    try {
      console.log("it is called");
      const openAIResponse = await generateCodeWithOpenAI(); // Call OpenAI API
      setGeneratedCode(openAIResponse);

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "system", content: "Here is your generated code:" },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "system",
          content: "Failed to generate the code. Please try again.",
        },
      ]);
    }
  };

  const generateCodeWithOpenAI = async (): Promise<string> => {
    const openai = new OpenAI({
      apiKey:
        "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", // Ensure your API key is set in your environment
    });

    // Define the prompt to ensure OpenAI generates valid chart code
    const codePrompt = `
      Given the following chart data:
      const chartData = [
        { month: "January", desktop: 186, mobile: 80 },
        { month: "February", desktop: 305, mobile: 200 },
        { month: "March", desktop: 237, mobile: 120 },
        { month: "April", desktop: 73, mobile: 190 },
        { month: "May", desktop: 209, mobile: 130 },
        { month: "June", desktop: 214, mobile: 140 }
      ];
      
      Generate the code for a bar chart using Chart.js in the following format:
      
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
          <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
        </BarChart>
      </ChartContainer>
    `;

    const response = await openai.completions.create({
      model: "gpt-4", // Specify the model
      prompt: codePrompt,
      max_tokens: 150, // Adjust the token count based on expected output size
      temperature: 0.2, // Lower temperature ensures more deterministic output
    });
    console.log(response.choices[0].text.trim());
    return response.choices[0].text.trim(); // Return the generated code
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <Card className="w-full max-w-md bg-gray-100 p-4 rounded-md shadow-md">
        <div className="overflow-y-auto h-96 p-4 mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 ${
                msg.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block p-2 rounded-md ${
                  msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-300"
                }`}
              >
                {msg.content}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </Card>

      {/* Render the generated chart code */}
      {generatedCode && (
        <div className="generated-chart">
          {/* Evaluate the generated code and render it */}
          {eval(generatedCode)}
        </div>
      )}
    </div>
  );
}
