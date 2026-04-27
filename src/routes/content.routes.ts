import { Router } from "express";
import { uploadContent, getLive } from "../controllers/content.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { upload } from "../middlewares/upload.middleware";
import {
	getAll,
	getPending,
	approve,
	reject,
	getTeacher,
} from "../controllers/approval.controller";

const router = Router();

// Teacher routes
router.post(
	"/upload",
	authMiddleware,
	roleMiddleware("TEACHER"),
	upload.single("file"),
	uploadContent,
);

// Teacher views their own uploads + status
router.get(
	"/my-uploads",
	authMiddleware,
	roleMiddleware("TEACHER"),
	getTeacher,
);

// Principal routes
// Principal views all content
router.get("/all", authMiddleware, roleMiddleware("PRINCIPAL"), getAll);

// Principal views only pending
router.get("/pending", authMiddleware, roleMiddleware("PRINCIPAL"), getPending);

router.post(
	"/:id/approve",
	authMiddleware,
	roleMiddleware("PRINCIPAL"),
	approve,
);

router.post("/:id/reject", authMiddleware, roleMiddleware("PRINCIPAL"), reject);

// Public route
router.get("/live/:teacherId", getLive);

export default router;
