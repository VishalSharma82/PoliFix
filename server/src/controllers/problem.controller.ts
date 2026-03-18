import { Request, Response } from 'express';
import * as problemService from '../services/problem.service';

export const getProblems = async (req: Request, res: Response) => {
    try {
        const problems = await problemService.getAllProblems();
        res.json({ data: problems });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const createProblem = async (req: Request, res: Response) => {
    try {
        const problem = await problemService.createProblem(req.body);
        res.status(201).json({ data: problem });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getProblemById = async (req: Request, res: Response) => {
    try {
        const problem = await problemService.getProblemById(req.params.id);
        res.json({ data: problem });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getPrioritizedProblems = async (req: Request, res: Response) => {
    try {
        const problems = await problemService.getPrioritizedProblems();
        res.json({ data: problems });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};
