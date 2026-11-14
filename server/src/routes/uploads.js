import { Router } from 'express';
import multer from 'multer';
import { imagekitEnabled, uploadToImageKit } from '../config/imagekit.js';
import { requireAdmin } from '../middleware/auth.js';
import { HttpError } from '../utils/httpError.js';

// Mounted behind requireAuth in app.js, and every route here also needs an admin.
// The photo stays in memory (never written to the server disk) and goes to ImageKit.
const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10 MB per photo
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|avif|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, 'Only photos are allowed (jpg, png, webp, avif)'));
  },
});

// GET /api/uploads/status -> { enabled }
router.get('/status', requireAdmin, (req, res) => {
  res.json({ enabled: imagekitEnabled() });
});

// POST /api/uploads?code=R01 (multipart, field "photo") -> 201 { url }
router.post('/', requireAdmin, upload.single('photo'), async (req, res) => {
  if (!imagekitEnabled()) {
    return res.status(503).json({ error: 'Uploads are off: add IMAGEKIT_PRIVATE_KEY to server/.env' });
  }
  if (!req.file) return res.status(400).json({ error: 'Choose a photo first' });

  // Keep each ring's photos in its own folder: eden/R01, eden/R02 ...
  const code = String(req.query.code || '').toUpperCase();
  const folder = /^[A-Z0-9-]{2,12}$/.test(code) ? `eden/${code}` : 'eden/other';

  const { url } = await uploadToImageKit({ ...req.file, folder });
  res.status(201).json({ url });
});

export default router;
