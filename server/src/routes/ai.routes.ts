import { Router } from "express";
import * as aiController from "../controllers/ai.controller";

const router = Router();

router.post("/analyze", aiController.analyzeImage);
router.post("/check-duplicate", aiController.checkDuplicate);
router.post("/chat", aiController.chatWithAI);
router.get("/predict", aiController.getPredictions);

export default router;
