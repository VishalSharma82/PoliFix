import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// gemini-2.0-flash: confirmed working model for this API key
const MODEL_NAME = "gemini-2.0-flash";

// In-memory cache for all AI responses to avoid duplicate API hits
const locationCache = new Map<string, { score: number; reason: string }>();
const chatResponseCache = new Map<string, string>();
const predictionCache = new Map<string, any[]>();

// Simple rate limiter: wait ms between sequential requests
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export const analyzeImage = async (base64Image: string, mimeType: string) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
    Analyze this image of a city infrastructure problem. 
    Identify the category of the problem from this list: pothole, streetlight, garbage, water_leak, road_damage, safety_issue.
    Also, suggest a severity level from this list: low, medium, high, critical.
    
    Respond ONLY with a JSON object in the following format:
    {
      "category": "category_name",
      "severity": "severity_level",
      "description": "brief description of what was detected"
    }
  `;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Image, mimeType } },
  ]);

  const response = await result.response;
  const text = response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");
  return JSON.parse(jsonMatch[0]);
};

export const evaluateLocationImportance = async (
  address: string,
  category: string,
  description: string
): Promise<{ score: number; reason: string }> => {
  // Cache key by address + category to avoid re-fetching for same location/type
  const cacheKey = `loc:${address.slice(0, 40)}:${category}`;
  const cached = locationCache.get(cacheKey);
  if (cached) return cached;

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
    Rate the civic importance of this report location (1-10).
    Address: ${address}
    Category: ${category}
    Description: ${description.slice(0, 100)}
    10 = near school/hospital/emergency route. 1 = remote low-traffic area.
    Respond ONLY with JSON: { "score": number, "reason": "max 12 words" }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  const value = jsonMatch
    ? JSON.parse(jsonMatch[0])
    : { score: 5, reason: "Default importance" };

  locationCache.set(cacheKey, value);
  return value;
};

export const checkSimilarity = async (newProblem: any, candidates: any[]) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const candidatesText = candidates
    .map((c, i) => `Candidate ${i}: ID=${c.id} Title="${c.title}" Category=${c.category}`)
    .join('\n');

  const prompt = `
    Is this new civic report a duplicate of any candidate?
    New: Title="${newProblem.title}" Category=${newProblem.category} Desc="${(newProblem.description || '').slice(0, 80)}"
    Candidates:\n${candidatesText}
    Only mark duplicate if similarity > 80%.
    Respond ONLY with JSON: { "isDuplicate": boolean, "duplicateId": string|null, "score": number, "reason": "brief" }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { isDuplicate: false, duplicateId: null, score: 0, reason: "AI parsing failed" };
  return JSON.parse(jsonMatch[0]);
};

export const generateChatResponse = async (message: string, context: any[]) => {
  // Cache identical messages for 5 min
  const cacheKey = `chat:${message.slice(0, 60)}`;
  const cached = chatResponseCache.get(cacheKey);
  if (cached) return cached;

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const contextSummary = context.slice(0, 30).map(p =>
    `- [${p.status}] ${p.category} at ${(p.address || 'Unknown').slice(0, 30)}: ${p.title} (${p.confirmed_count} confirms)`
  ).join('\n');

  const prompt = `
    You are "PoliFix AI Assistant", a city infrastructure expert.
    City problems snapshot (top 30):
    ${contextSummary}
    
    User: "${message}"
    
    Be concise, helpful, data-driven. Respond in Markdown.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  chatResponseCache.set(cacheKey, text);
  // Auto-expire cache after 5 minutes
  setTimeout(() => chatResponseCache.delete(cacheKey), 5 * 60 * 1000);

  return text;
};

export const predictInfrastructureRisks = async (problems: any[]) => {
  // Cache predictions based on problem count to avoid repeat calls
  const cacheKey = `predict:${problems.length}:${problems.slice(0, 3).map(p => p.id).join(',')}`;
  const cached = predictionCache.get(cacheKey);
  if (cached) return cached;

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  // Only send top 30 most relevant problems to reduce token usage
  const problemsList = problems.slice(0, 30).map(p => ({
    lat: p.lat,
    lng: p.lng,
    category: p.category,
    severity: p.severity,
    confirms: p.confirmed_count,
  }));

  const prompt = `
    As a city planner AI, analyze these infrastructure problems and predict up to 5 future risk zones.
    Data: ${JSON.stringify(problemsList)}
    Look for: pothole clusters→road collapse, streetlight outages→grid failure, water+garbage→health hazard.
    Respond ONLY with JSON array: [{ "lat": number, "lng": number, "intensity": number(0-1), "reason": "short", "type": "Road|Grid|Health|Safety" }]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const value = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    predictionCache.set(cacheKey, value);
    setTimeout(() => predictionCache.delete(cacheKey), 10 * 60 * 1000);
    return value;
  } catch (err: any) {
    console.warn('AI Prediction skipped, returning empty:', err?.status || err?.message);
    return [];
  }
};
