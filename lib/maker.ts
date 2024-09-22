import { GoogleGenerativeAI } from "@google/generative-ai";

interface PostObject {
  title: string;
  html: string;
  tags: string[];
  linkedIn: string;
}

export const postCreator = async (prompt: string): Promise<void> => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    try {
      sendPost(JSON.parse(text));
    } catch (error) {
      console.log("Error in JSON parsing, attempting to fix format...");

      const formatPrompt = `
      Please fix any syntax errors in the given JSON object and return a valid JSON object in this format:
      {
         "title": "Title of the topic",
         "html": "HTML content of the topic",
         "tags": ["tag1", "tag2"],
         "linkedIn": "Proper post description to post on LinkedIn and the link is here:"
      }
      
      Here is the text to fix:
      ${text}`;

      const jsonResult = await model.generateContent(formatPrompt);
      const jsonText = await jsonResult.response.text();

      try {
      } catch (parseError) {
        console.error("Failed to parse corrected JSON:", parseError);
      }
    }
  } catch (error) {
    console.error("Error in generating content:", error);
  }
};
