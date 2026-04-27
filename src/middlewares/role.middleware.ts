import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const roleMiddleware = (role: string) => {
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (req.user?.role !== role) {
			return res.status(403).json({ message: "Forbidden" });
		}
		next();
	};
};
