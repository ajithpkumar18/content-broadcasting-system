/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Upload, approve, reject, and view content
 *
 * /api/content/upload:
 *   post:
 *     summary: Upload new content (Teacher only)
 *     tags: [Content]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, title, subject, startTime, endTime]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *                 example: Chapter 3 Notes
 *               subject:
 *                 type: string
 *                 example: Maths
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-28T10:00:00Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-28T18:00:00Z"
 *               duration:
 *                 type: integer
 *                 example: 5
 *                 description: Minutes per rotation (default 5)
 *     responses:
 *       200:
 *         description: Content uploaded, status is PENDING
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       400:
 *         description: Missing fields or invalid file
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only teachers can upload
 *
 * /api/content/my-uploads:
 *   get:
 *     summary: View your uploads and their status (Teacher only)
 *     tags: [Content]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of content uploaded by this teacher
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Content'
 *       403:
 *         description: Forbidden
 *
 * /api/content/all:
 *   get:
 *     summary: View all content across all teachers (Principal only)
 *     tags: [Content]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All content items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Content'
 *       403:
 *         description: Only principals can access this
 *
 * /api/content/pending:
 *   get:
 *     summary: View pending content awaiting approval (Principal only)
 *     tags: [Content]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending content
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Content'
 *       403:
 *         description: Only principals can access this
 *
 * /api/content/{id}/approve:
 *   post:
 *     summary: Approve a content item (Principal only)
 *     tags: [Content]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       403:
 *         description: Only principals can approve
 *
 * /api/content/{id}/reject:
 *   post:
 *     summary: Reject a content item with a reason (Principal only)
 *     tags: [Content]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectRequest'
 *     responses:
 *       200:
 *         description: Content rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       400:
 *         description: Reason is required
 *
 * /api/content/live/{teacherId}:
 *   get:
 *     summary: Get live content for a teacher (Public — no auth needed)
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the teacher
 *         example: "abc123-uuid"
 *     responses:
 *       200:
 *         description: Active content per subject, or no content message
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/LiveContent'
 *                 - $ref: '#/components/schemas/NoContent'
 */

export {};
