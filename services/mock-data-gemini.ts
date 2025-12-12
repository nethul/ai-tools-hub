import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Gemini API Key is missing!");
}

const ai = new GoogleGenAI({ apiKey: apiKey! });

export interface SchemaItem {
    id: string;
    name: string;
    description: string;
}

export const generateDataScript = async (schema: SchemaItem[]): Promise<string> => {
    try {
        const schemaDescription = schema.map(item => `- Column "${item.name}": ${item.description}`).join('\n');

        const prompt = `
      You are a JavaScript code generator for a mock data tool.
      Write a JavaScript function named \`generateData(count)\` that returns an array of objects.
      
      Requirements:
      1. The function must accept a \`count\` parameter (number of rows).
      2. It must return an array of ${schema.length} objects.
      3. Each object must have the following keys and adhering strictly to the description:
      ${schemaDescription}
      
      Tools available:
      - You can use the globally available \`faker\` object (from @faker-js/faker). Example: \`faker.person.fullName()\`, \`faker.internet.email()\`.
      - If a specific style (e.g., "Sri Lankan names") is requested and faker doesn't support it directly, implement a custom array or logic within the function to generate it authentically.
      
      Output Format:
      - Return ONLY the JavaScript code for the function.
      - Do NOT wrap in markdown code blocks.
      - Do NOT include explanations.
      - The code must be valid ES6 JavaScript.
      - Ensure the function is exported or just defined such that \`return generateData(count)\` would work if eval'd. actually, just return the function definition.
    `;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: { parts: [{ text: prompt }] },
        });

        let code = response.text || "";

        // Clean up markdown if present despite instructions
        code = code.replace(/```javascript/g, '').replace(/```/g, '').trim();

        return code;

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
