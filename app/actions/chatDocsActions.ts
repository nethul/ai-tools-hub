'use server';

import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../../types";
import fs from 'fs';
import path from 'path';
import os from 'os';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

export async function uploadFileAndCreateStore(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        throw new Error("No file provided");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a unique store name
    // Create a unique store name
    const storeName = `store-${Date.now()}`;

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, file.name);

    try {
        // 1. Create File Search Store
        const fileSearchStore = await ai.fileSearchStores.create({
            config: { displayName: storeName }
        });

        console.log(`Created store: ${fileSearchStore.name}`);

        // 2. Upload File
        fs.writeFileSync(tempFilePath, buffer);

        if (!fileSearchStore.name) {
            throw new Error("Failed to create file search store: name is missing");
        }

        let operation = await ai.fileSearchStores.uploadToFileSearchStore({
            file: tempFilePath,
            fileSearchStoreName: fileSearchStore.name,
            config: {
                displayName: file.name,
            }
        });

        // 3. Poll for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            operation = await ai.operations.get({ operation });
        }

        console.log(`File uploaded and processed: ${fileSearchStore.name}`);
        return { success: true, storeName: fileSearchStore.name };

    } catch (error: any) {
        console.error("Error in uploadFileAndCreateStore:", error);
        return { success: false, error: error.message || "Failed to process file." };
    } finally {
        // Cleanup temp file
        if (fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (cleanupError) {
                console.error("Failed to cleanup temp file:", cleanupError);
            }
        }
    }
}

export async function chatWithStore(storeName: string, query: string, history: ChatMessage[]) {
    try {
        // Construct history for the model
        // The SDK might have a specific way to handle history, but generateContent usually takes 'contents'.
        // We can format the history into the prompt or use a chat session if supported with tools.
        // The example uses `ai.models.generateContent`.

        // Let's format the history as a context string or use the `contents` array if we were doing a chat session.
        // For a simple RAG, we can just send the query, but history is nice.
        // Let's try to pass the history as previous turns if possible, or just append it.

        // Simple approach: Just send the query with the tool. 
        // If we want history, we should format it.

        // Let's build the contents array.
        const contents = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));

        // Add the new user query
        contents.push({
            role: 'user',
            parts: [{ text: query }]
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                tools: [
                    {
                        fileSearch: {
                            fileSearchStoreNames: [storeName]
                        }
                    }
                ]
            }
        });

        return { success: true, response: response.text };

    } catch (error: any) {
        console.error("Error in chatWithStore:", error);
        return { success: false, error: error.message };
    }
}
