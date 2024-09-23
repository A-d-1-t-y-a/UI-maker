"use client";
import { useState } from "react";
import axios from "axios";
import { Sandpack } from "@codesandbox/sandpack-react";

export default function Home() {
  const [code, setCode] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/api/generate-code", {
        prompt,
      });

      setCode(response.data.code);
    } catch (error) {
      console.error("Error generating code:", error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-2xl font-bold mb-4">Code Generator</h1>

      <form onSubmit={handleSubmit} className="mb-6 flex items-center gap-2">
        <textarea
          value={prompt}
          placeholder="Enter your prompt"
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border border-gray-300 text-black rounded"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate Code"}
        </button>
      </form>

      {code && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">Live Preview:</h2>
          <Sandpack
            template="react-ts"
            files={{
              "/App.tsx": code,
            }}
            options={{
              showNavigator: true,
              editorHeight: "400px",
            }}
          />
        </div>
      )}
    </div>
  );
}
