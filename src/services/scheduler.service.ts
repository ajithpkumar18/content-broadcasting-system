import { prisma } from "../utils/db";

export const getLiveContent = async (teacherId: string) => {
  const now = new Date();

  // Fetch all approved content within the active time window for this teacher
  // Include schedule (with slot) for rotation logic
  const eligibleContent = await prisma.content.findMany({
    where: {
      uploadedById: teacherId,
      status: "APPROVED",
      startTime: { lte: now },
      endTime: { gte: now },
      schedule: { isNot: null }, // must have a schedule entry
    },
    include: {
      schedule: {
        include: { slot: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (eligibleContent.length === 0) return null;

  // Group by subject using slot.subject
  const subjectMap: Record<
    string,
    Array<{
      id: string;
      title: string;
      description: string | null;
      subject: string;
      fileUrl: string;
      fileType: string;
      startTime: Date;
      endTime: Date;
      duration: number;
      rotationOrder: number;
    }>
  > = {};

  for (const c of eligibleContent) {
    if (!c.schedule) continue;
    const subject = c.schedule.slot.subject;

    if (!subjectMap[subject]) subjectMap[subject] = [];

    subjectMap[subject].push({
      id: c.id,
      title: c.title,
      description: c.description,
      subject,
      fileUrl: c.fileUrl,
      fileType: c.fileType,
      startTime: c.startTime!,
      endTime: c.endTime!,
      duration: c.schedule.duration,
      rotationOrder: c.schedule.rotationOrder,
    });
  }

  const result: Record<string, any> = {};

  for (const [subject, items] of Object.entries(subjectMap)) {
    if (!items || items.length === 0) continue;

    // Sort by rotation order for deterministic playlist
    items.sort((a, b) => a.rotationOrder - b.rotationOrder);

    const active = calculateActiveContent(items, now);
    if (active) result[subject] = active;
  }

  return Object.keys(result).length > 0 ? result : null;
};

/**
 * CORE SCHEDULING ALGORITHM
 *
 * Uses the earliest startTime in the subject group as the epoch (clock start).
 * Calculates how far into the current rotation cycle we are using modulo.
 * Walks the playlist to find which content owns that position.
 *
 * Example:
 *   Epoch = 12:00 PM
 *   Playlist: A(5min) → B(5min) → C(5min)  [total cycle = 15min]
 *   Current time = 12:22 PM → elapsed = 22min
 *   Position in cycle = 22 % 15 = 7min
 *   7min falls in B's slot (5–10min) → B is active ✓
 */
function calculateActiveContent(
  items: Array<{ duration: number; startTime: Date; [key: string]: any }>,
  now: Date,
) {
  // Total cycle in milliseconds
  const totalCycleMs = items.reduce(
    (sum, c) => sum + c.duration * 60 * 1000,
    0,
  );

  if (totalCycleMs === 0) return null;

  // Use earliest startTime as the reference epoch
  const epoch = Math.min(...items.map((c) => c.startTime.getTime()));
  const nowMs = now.getTime();

  if (nowMs < epoch) return null;

  // Position within the current loop
  const elapsedInCycle = (nowMs - epoch) % totalCycleMs;

  let cursor = 0;
  for (const item of items) {
    const slotMs = item.duration * 60 * 1000;
    if (elapsedInCycle >= cursor && elapsedInCycle < cursor + slotMs) {
      return item;
    }
    cursor += slotMs;
  }

  return null;
}
