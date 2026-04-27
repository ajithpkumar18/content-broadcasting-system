import { prisma } from "../utils/db";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";

export const registerUser = async ({ name, email, password, role }: any) => {
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) throw new Error("User already exists");

	const hashed = await hashPassword(password);

	return prisma.user.create({
		data: { name, email, password: hashed, role },
	});
};

export const loginUser = async ({ email, password }: any) => {
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) throw new Error("Invalid credentials");

	const isMatch = await comparePassword(password, user.password);
	if (!isMatch) throw new Error("Invalid credentials");

	const token = signToken({ id: user.id, role: user.role });

	return { token };
};
