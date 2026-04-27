import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createContent } from "../services/content.service";
import { getLiveContent } from "../services/scheduler.service";

export const uploadContent = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: "File is required" });
		}

		const content = await createContent(req.body, req.file, req.user.id);

		res.json(content);
	} catch (err: any) {
		res.status(400).json({ message: err.message || "Upload failed" });
	}
};

export const getLive = async (req: Request, res: Response) => {
	try {
		const { teacherId } = req.params;
		const id = Array.isArray(teacherId) ? teacherId[0] : teacherId;

		if (!id) {
			return res.status(400).json({ message: "Teacher ID is required" });
		}

		const data = await getLiveContent(id);

		if (!data || Object.keys(data).length === 0) {
			return res.json({ message: "No content available" });
		}

		res.json(data);
	} catch (err) {
		console.error(err); // 👈 important
		return res.status(500).json({ message: "Error fetching live content" });
	}
};
