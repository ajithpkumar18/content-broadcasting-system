import { Router } from "express";
import { getLive } from "../controllers/content.controller";

const router = Router();

// Public student-facing endpoint
router.get("/live/:teacherId", getLive);

export default router;
