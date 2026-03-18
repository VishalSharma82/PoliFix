import { Router } from 'express';
import { getProblems, createProblem, getProblemById, getPrioritizedProblems } from '../controllers/problem.controller';

const router = Router();

router.get('/', getProblems);
router.get('/prioritized', getPrioritizedProblems);
router.get('/:id', getProblemById);
router.post('/', createProblem);

export default router;
