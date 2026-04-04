import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load from server/.env since that's where the key was saved
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

async function testGemini() {
  const key = process.env.GEMINI_API_KEY;
  console.log('Testing Key:', key ? 'FOUND' : 'MISSING');
  
  if (!key) return;

  const ai = new GoogleGenAI({ apiKey: key });
  
  const prompt = `
Generate a sample code review in JSON format for a simple calculator.
Structure:
{
  "complexityComparison": "str",
  "winnerAdvantage": "str",
  "loserMistakes": "str",
  "suggestions": ["str"],
  "winnerScore": 100,
  "loserScore": 50,
  "optimizedRefactor": "code",
  "runtimeMs": "24ms",
  "memoryMb": "14MB"
}`;

  try {
    console.log('--- Sending request to Gemini ---');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    console.log('--- Response Received ---');
    console.log(response.text);
    console.log('--- TEST PASSED: Gemini API is healthy ---');
  } catch (err) {
    console.error('--- TEST FAILED: Gemini API Error ---');
    console.error(err.message);
  }
}

testGemini();
