import { supabase } from '../config/supabase';

export const getAllProblems = async () => {
    const { data, error } = await supabase.from('problems').select('*');
    if (error) throw error;
    return data;
};

export const createProblem = async (problemData: any) => {
    const { data, error } = await supabase.from('problems').insert(problemData).select();
    if (error) throw error;
    return data;
};

export const getProblemById = async (id: string) => {
    const { data, error } = await supabase.from('problems').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
};

// In-memory location importance cache (persists across requests within same server session)
const locationCache = new Map<string, { score: number; reason: string }>();

const severityWeights: Record<string, number> = { critical: 10, high: 7, medium: 4, low: 2 };

// Helper: derive score without AI when cache misses (pure local heuristic)
function heuristicLocationScore(address: string, category: string): { score: number; reason: string } {
    const addr = address.toLowerCase();
    // Check for high-importance keywords
    if (/school|hospital|clinic|emergency|police|fire|station|market|mall|junction/.test(addr)) {
        return { score: 9, reason: "Near critical civic infrastructure" };
    }
    if (/road|highway|main|avenue|sector|street/.test(addr)) {
        return { score: 7, reason: "On major road/public thoroughfare" };
    }
    if (category === 'safety_issue' || category === 'water_leak') {
        return { score: 7, reason: "High-impact category in populated area" };
    }
    return { score: 5, reason: "Standard civic area" };
}

export const getPrioritizedProblems = async () => {
    const { data: problems, error } = await supabase.from('problems').select('*');
    if (error) throw error;

    const { evaluateLocationImportance } = require('./ai.service');

    // Separate problems into: cached (instant) and uncached (need AI, max 3 at a time)
    const cached: any[] = [];
    const uncached: any[] = [];

    for (const problem of problems) {
        const cacheKey = `loc:${(problem.address || '').slice(0, 40)}:${problem.category}`;
        if (locationCache.has(cacheKey)) {
            cached.push({ problem, locationInfo: locationCache.get(cacheKey)! });
        } else {
            uncached.push({ problem, cacheKey });
        }
    }

    // Process uncached: use AI for first 3, heuristic for the rest (to preserve quota)
    const AI_BATCH_SIZE = 3;
    const aiResults: Array<{ problem: any; locationInfo: { score: number; reason: string } }> = [];

    for (let i = 0; i < uncached.length; i++) {
        const { problem, cacheKey } = uncached[i];
        let locationInfo: { score: number; reason: string };

        if (i < AI_BATCH_SIZE) {
            try {
                locationInfo = await evaluateLocationImportance(
                    problem.address || "Unknown address",
                    problem.category,
                    problem.description || ""
                );
                locationCache.set(cacheKey, locationInfo);
            } catch (err: any) {
                // On rate limit or error, fall back to heuristic
                console.warn(`AI skipped for problem ${problem.id}, using heuristic: ${err?.status || err?.message}`);
                locationInfo = heuristicLocationScore(problem.address || '', problem.category);
                locationCache.set(cacheKey, locationInfo);
            }
        } else {
            // Use heuristic for remaining uncached problems to protect quota
            locationInfo = heuristicLocationScore(problem.address || '', problem.category);
            locationCache.set(cacheKey, locationInfo);
        }

        aiResults.push({ problem, locationInfo });
    }

    // Combine and score all problems
    const allResults = [...cached, ...aiResults];

    const prioritized = allResults.map(({ problem, locationInfo }) => {
        const sWeight = severityWeights[problem.severity] || 4;
        const cWeight = Math.min((problem.confirmed_count || 0), 10);
        const lWeight = locationInfo.score || 5;

        const ageMs = Date.now() - new Date(problem.created_at).getTime();
        const ageDays = ageMs / (1000 * 60 * 60 * 24);
        const rWeight = Math.min(ageDays * 2, 10);

        const totalScore = (sWeight * 1.0) + (cWeight * 0.5) + (lWeight * 0.5) + (rWeight * 0.3);

        return {
            ...problem,
            ai_priority_score: totalScore,
            location_importance: lWeight,
            location_importance_reason: locationInfo.reason,
        };
    });

    return prioritized.sort((a, b) => b.ai_priority_score - a.ai_priority_score);
};
