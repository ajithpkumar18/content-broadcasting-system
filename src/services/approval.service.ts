import { prisma } from "../utils/db";

export const getAllContent = async () => {
  return prisma.content.findMany({
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { id: true, name: true, email: true } },
      schedule: { include: { slot: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getTeacherContent = async (userId: string) => {
  return prisma.content.findMany({
    where: { uploadedById: userId },
    include: {
      schedule: { include: { slot: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getPendingContent = async () => {
  return prisma.content.findMany({
    where: { status: "PENDING" },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
      schedule: { include: { slot: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const approveContent = async (contentId: string, userId: string) => {
  return prisma.content.update({
    where: { id: contentId },
    data: {
      status: "APPROVED",
      approvedById: userId,
      approvedAt: new Date(),
    },
  });
};

export const rejectContent = async (
  contentId: string,
  userId: string,
  reason: string,
) => {
  if (!reason) throw new Error("Rejection reason required");

  return prisma.content.update({
    where: { id: contentId },
    data: {
      status: "REJECTED",
      rejectionReason: reason,
      approvedById: userId,
      approvedAt: new Date(),
    },
  });
};
