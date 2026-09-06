import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

// Resolver la ruta absoluta del archivo JSON de credenciales
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
}

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT || 'smartflow-506917',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
      contents: 'Responde con un "Conexión exitosa" si me recibes.',
    });

    console.log('✅ Vertex AI (Gemini 2.5 Pro) respondió:', response.text);
  } catch (err) {
    console.error('❌ Error de conexión:', err);
  }
}

test();