import { Router } from 'express';
import { getProblems, createProblem, getProblemById, getPrioritizedProblems, deleteProblem } from '../controllers/problem.controller';

const router = Router();

router.get('/', getProblems);
router.get('/prioritized', getPrioritizedProblems);
router.get('/:id', getProblemById);
router.post('/', createProblem);
router.delete('/:id', deleteProblem);

export default router;
