require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = 3000;

app.use(express.json());

app.all('/api.php', (req, res) => {
    res.json({
        status: "online",
        message: "El backend en Node.js Express está funcionando correctamente.",
    });
});

app.post('/api/gemini/generate', async (req, res) => {
    try {
        const { prompt, systemInstruction } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "GEMINI_API_KEY no está configurada en el servidor." });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction || "Eres un experto en ventas y atención al cliente corporativo.",
                temperature: 0.7,
            }
        });
        
        res.json({ result: response.text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: error.message || "Error al comunicarse con la IA" });
    }
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
