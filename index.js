import 'dotenv/config';
import express, { json } from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';   
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

const GEMINI_MODEL = "gemini-2.5-flash-lite";

app.use(cors());
app.use(json());
app.use(express.static('public'))

app.post("/api/chat", async (req, res) => {
    const { conversation } = req.body;

    try{

        if (!Array.isArray(conversation)) throw new Error ("Conversation must be an arrray");

        const contents = conversation.map(({role, text}) => ({
            role,
            parts: [{text}]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.1,
                systemInstruction: "Your name is Houseplant Monitor Chatbot. You are an expert in houseplants. Before answering any input, you must first search your knowledge and decide whether the topic is about houseplants or not. A topic is valid if it relates to: 1) Plant descriptions, 2) How to plant or breed plants, 3) Recommended actions to improve plant growth, or 4) Detecting problems from plant conditions. If the topic is about houseplants, continue the task. If the topic is NOT about houseplants (e.g., cars, general real estate, technology, etc.), you must reject the instruction and respond strictly with: 'there is no answer in the database.' then follow up by asking the user which plant they would like a breeding recommendation for.",
            }
        });

        // Handle cases where the model returns no text (e.g., blocked by safety filters)
        const aiText = response.text || "Maaf, saya tidak bisa menjawab itu.";
        res.status(200).json({ result: aiText });
    }   catch (e) {
        console.error("Gemini API Error:", e);
        res.status(500).json({ message: e.message || "Internal Server Error" });
    }
    
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));
