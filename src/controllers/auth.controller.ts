import { Request, Response } from "express";
import { prisma } from "../utils/db";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
	try {
		const { name, email, password, role } = req.body;

		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) {
			return res.status(400).json({ message: "User already exists" });
		}

		const hashed = await hashPassword(password);

		const user = await prisma.user.create({
			// ts-ignore
			data: {
				name,
				email,
				password: hashed,
				role,
			},
		});

		res.json(user);
	} catch (err) {
		res.status(500).json({ message: "Error registering user" });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const isMatch = await comparePassword(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const token = signToken({
			id: user.id,
			role: user.role,
		});

		res.json({ token });
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ message: "Error logging in", err });
	}
};
