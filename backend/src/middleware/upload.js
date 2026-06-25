import multer from 'multer';
import { mkdirSync } from 'node:fs';

mkdirSync('uploads', { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});
