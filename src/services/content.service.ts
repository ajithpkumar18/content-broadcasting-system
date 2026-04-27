import { prisma } from "../utils/db";

export const createContent = async (
  data: any,
  file: Express.Multer.File,
  userId: string,
) => {
  if (!data.title || !data.subject) {
    throw new Error("Title and subject are required");
  }

  const duration = data.duration ? Number(data.duration) : 5;

  // Create content record
  const content = await prisma.content.create({
    data: {
      title: data.title,
      description: data.description,
      subject: data.subject,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
      status: "PENDING",
      startTime: data.startTime ? new Date(data.startTime) : null,
      endTime: data.endTime ? new Date(data.endTime) : null,
      uploadedById: userId,
    },
  });

  // Get or create the ContentSlot for this subject
  const slot = await prisma.contentSlot.upsert({
    where: { subject: data.subject },
    update: {},
    create: { subject: data.subject },
  });

  // Find the next rotation order for this teacher + slot
  const lastSchedule = await prisma.contentSchedule.findFirst({
    where: {
      slotId: slot.id,
      content: { uploadedById: userId },
    },
    orderBy: { rotationOrder: "desc" },
  });

  const nextOrder = lastSchedule ? lastSchedule.rotationOrder + 1 : 1;

  // Create the ContentSchedule entry
  await prisma.contentSchedule.create({
    data: {
      contentId: content.id,
      slotId: slot.id,
      rotationOrder: nextOrder,
      duration,
    },
  });

  return content;
};
