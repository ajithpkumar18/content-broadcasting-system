import multer from "multer";
import path from "path";
import fs from "fs";

// ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const unique = Date.now() + "-" + file.originalname;
		cb(null, unique);
	},
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
	const allowed = ["image/jpeg", "image/png", "image/gif"];

	if (allowed.includes(file.mimetype)) cb(null, true);
	else cb(new Error("Invalid file type"));
};

export const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
