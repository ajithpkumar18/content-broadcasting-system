import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  getAllContent,
  getTeacherContent,
  getPendingContent,
  approveContent,
  rejectContent,
} from "../services/approval.service";

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getAllContent();
    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch content" });
  }
};

export const getTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getTeacherContent(req.user.id);
    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch content" });
  }
};

export const getPending = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getPendingContent();
    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch pending content" });
  }
};

export const approve = async (req: AuthRequest, res: Response) => {
  try {
    const content = await approveContent(req.params.id, req.user.id);
    res.json(content);
  } catch {
    res.status(400).json({ message: "Approval failed" });
  }
};

export const reject = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const content = await rejectContent(req.params.id, req.user.id, reason);
    res.json(content);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
