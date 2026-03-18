import { Request, Response } from "express";
import * as aiService from "../services/ai.service";
import * as problemService from "../services/problem.service";

export const analyzeImage = async (req: Request, res: Response) => {
  try {
    const { image, mimeType, filename } = req.body;

    if (!image || !mimeType) {
      return res.status(400).json({ error: "Image data and MIME type are required." });
    }

    let result: any;
    let isHeuristic = false;

    try {
      result = await aiService.analyzeImage(image, mimeType);
    } catch (aiErr: any) {
      // On quota/rate-limit, use a smart local fallback instead of crashing
      if (aiErr?.status === 429 || aiErr?.status === 404) {
        isHeuristic = true;
        const name = (filename || '').toLowerCase();
        // Guess category from filename keywords
        let category = 'road_damage';
        let severity = 'medium';

        if (/pothole|hole|pit/.test(name)) { category = 'pothole'; severity = 'high'; }
        else if (/light|lamp|street/.test(name)) { category = 'streetlight'; severity = 'medium'; }
        else if (/garbage|trash|waste|litter/.test(name)) { category = 'garbage'; severity = 'medium'; }
        else if (/water|leak|flood|drain/.test(name)) { category = 'water_leak'; severity = 'high'; }
        else if (/road|crack|damage|asphalt/.test(name)) { category = 'road_damage'; severity = 'medium'; }
        else if (/safety|danger|hazard|broken/.test(name)) { category = 'safety_issue'; severity = 'high'; }

        result = {
          category,
          severity,
          description: 'Auto-detected from image context (AI quota limit reached, select manually if incorrect)',
        };
      } else {
        throw aiErr;
      }
    }

    res.json({ data: result, isHeuristic });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const checkDuplicate = async (req: Request, res: Response) => {
  try {
    const { newProblem, candidates } = req.body;

    if (!newProblem || !candidates) {
      return res.status(400).json({ error: "newProblem and candidates are required." });
    }

    const result = await aiService.checkSimilarity(newProblem, candidates);
    res.json({ data: result });
  } catch (error) {
    console.error("AI Duplicate Check Error:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Fetch context (unresolved problems)
    const problems = await problemService.getAllProblems();
    const unresolved = (problems || []).filter((p: any) => p.status !== 'resolved');

    let response: string;
    try {
      // Try Gemini first
      response = await aiService.generateChatResponse(message, unresolved);
    } catch (aiErr: any) {
      // On quota/rate-limit errors (429) or model-not-found (404), use local smart engine
      if (aiErr?.status === 429 || aiErr?.status === 404 || String(aiErr?.message).includes('quota') || String(aiErr?.message).includes('limit')) {
        console.log('Gemini unavailable, using local smart chat engine...');
        const { smartLocalChat } = require('../services/local-chat.service');
        response = await smartLocalChat(message);
      } else {
        throw aiErr; // Re-throw unexpected errors
      }
    }

    res.json({ data: response });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getPredictions = async (req: Request, res: Response) => {
  try {
    const problems = await problemService.getAllProblems();
    const predictions = await aiService.predictInfrastructureRisks(problems || []);
    res.json({ data: predictions });
  } catch (error) {
    console.error("AI Prediction Error:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
