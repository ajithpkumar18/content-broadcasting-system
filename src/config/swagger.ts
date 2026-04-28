import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Content Broadcasting System API",
			version: "1.0.0",
			description:
				"Backend API for teachers to upload content, principals to approve it, and students to view live content.",
		},
		servers: [
			{
				url: "http://localhost:5000",
				description: "Local development server",
			},
			{
				url: "https://content-broadcasting-system-kmxp.onrender.com/",
				description: "Staging development server",
			},
		],
		components: {
			securitySchemes: {
				BearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "Enter your JWT token from /api/auth/login",
				},
			},
			schemas: {
				// ── Users ─────────────────────────────────────────
				RegisterRequest: {
					type: "object",
					required: ["name", "email", "password", "role"],
					properties: {
						name: { type: "string", example: "Ajith Kumar" },
						email: { type: "string", example: "ajith@school.com" },
						password: { type: "string", example: "secret123" },
						role: {
							type: "string",
							enum: ["TEACHER", "PRINCIPAL"],
						},
					},
				},
				LoginRequest: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: { type: "string", example: "ajith@school.com" },
						password: { type: "string", example: "secret123" },
					},
				},
				LoginResponse: {
					type: "object",
					properties: {
						token: {
							type: "string",
							example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
						},
					},
				},
				// ── Content ───────────────────────────────────────
				Content: {
					type: "object",
					properties: {
						id: { type: "string", example: "uuid-here" },
						title: { type: "string", example: "Chapter 3 Notes" },
						description: {
							type: "string",
							example: "Important formulas",
						},
						subject: { type: "string", example: "Maths" },
						fileUrl: {
							type: "string",
							example: "/uploads/file.jpg",
						},
						fileType: { type: "string", example: "image/jpeg" },
						fileSize: { type: "integer", example: 204800 },
						status: {
							type: "string",
							enum: ["PENDING", "APPROVED", "REJECTED"],
						},
						rejectionReason: {
							type: "string",
							example: "Poor image quality",
						},
						startTime: { type: "string", format: "date-time" },
						endTime: { type: "string", format: "date-time" },
						approvedAt: { type: "string", format: "date-time" },
						createdAt: { type: "string", format: "date-time" },
					},
				},
				LiveContent: {
					type: "object",
					description: "Active content per subject right now",
					additionalProperties: {
						type: "object",
						properties: {
							id: { type: "string" },
							title: { type: "string" },
							subject: { type: "string" },
							fileUrl: { type: "string" },
							fileType: { type: "string" },
							duration: {
								type: "integer",
								description: "Minutes this content is shown",
							},
							rotationOrder: { type: "integer" },
						},
					},
					example: {
						Maths: {
							id: "abc123",
							title: "Chapter 3 Notes",
							subject: "Maths",
							fileUrl: "/uploads/file.jpg",
							fileType: "image/jpeg",
							duration: 5,
							rotationOrder: 1,
						},
						Science: {
							id: "def456",
							title: "Periodic Table",
							subject: "Science",
							fileUrl: "/uploads/table.png",
							fileType: "image/png",
							duration: 5,
							rotationOrder: 1,
						},
					},
				},
				NoContent: {
					type: "object",
					properties: {
						message: {
							type: "string",
							example: "No content available",
						},
					},
				},
				ErrorResponse: {
					type: "object",
					properties: {
						message: { type: "string", example: "Unauthorized" },
					},
				},
				RejectRequest: {
					type: "object",
					required: ["reason"],
					properties: {
						reason: {
							type: "string",
							example: "Image is too blurry",
						},
					},
				},
			},
		},
	},
	// Tell swagger-jsdoc where your JSDoc comments live
	apis: ["./src/docs/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
