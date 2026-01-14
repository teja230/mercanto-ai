
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION } from '../constants';
import { Message, MessageRole } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

let chatSession: Chat | null = null;

/**
 * Reconstructs the chat history format for the Gemini SDK
 */
const formatHistory = (messages: Message[]) => {
    return messages
        .filter(m => !m.isTyping && m.content)
        .map(m => ({
            role: m.role === MessageRole.USER ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));
};

export const getChatSession = (history: Message[] = [], useThinking: boolean = false): Chat => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    chatSession = ai.chats.create({
        model: GEMINI_MODEL_NAME,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            // Only apply thinking budget if requested for complex queries
            ...(useThinking ? { thinkingConfig: { thinkingBudget: 32768 } } : {})
        },
        history: formatHistory(history)
    });
    
    return chatSession;
};

export const sendMessageToGemini = async (
    message: string, 
    history: Message[] = [], 
    useThinking: boolean = false
): Promise<string> => {
    try {
        // We recreate the session with current history to ensure context persistence across reloads
        const session = getChatSession(history, useThinking);
        const result: GenerateContentResponse = await session.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        return "I encountered an error analyzing your data. This might be due to a complex query or a connection issue. Please try again.";
    }
};

export const resetSession = () => {
    chatSession = null;
};
