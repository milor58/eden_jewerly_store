// ImageKit (free plan) stores the ring photos. We call its upload REST API
// directly with fetch, so no SDK is needed. Only the PRIVATE key is required,
// and it stays on the server (never in the React app).
// Docs: https://imagekit.io/docs/api-reference/upload-file/upload-file
const UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

export function imagekitEnabled() {
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);
}

// Clean file name: letters, numbers, - and _ only, keeping the extension.
function cleanName(name = 'photo.jpg') {
  const ext = (name.match(/\.(jpe?g|png|webp|avif|gif)$/i)?.[0] || '.jpg').toLowerCase();
  const base = name
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'photo'}${ext}`;
}

// buffer: file bytes from multer. Returns { url, fileId }.
export async function uploadToImageKit({ buffer, mimetype, originalname, folder = 'eden' }) {
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimetype }), originalname);
  form.append('fileName', cleanName(originalname));
  form.append('folder', folder);
  form.append('useUniqueFileName', 'true');

  const auth = Buffer.from(`${process.env.IMAGEKIT_PRIVATE_KEY}:`).toString('base64');
  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}` },
    body: form,
    signal: AbortSignal.timeout(60_000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    const err = new Error(data.message || `ImageKit upload failed (${res.status})`);
    err.status = res.status === 401 || res.status === 403 ? 500 : 502;
    throw err;
  }
  return { url: data.url, fileId: data.fileId };
}
