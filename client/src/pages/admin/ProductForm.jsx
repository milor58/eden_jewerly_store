/* © 2026 Eden Jewelry. All rights reserved. */
import { useState } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { api, apiFetch } from '../../api/client.js';
import { sized } from '../../utils/image.js';

const STONE_OPTIONS = ['none', 'emerald', 'diamond', 'moissanite', 'zircon'];
const COLOR_OPTIONS = ['silver', 'grey'];
const looksLikeVideo = (url) => /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url);

const toForm = (p) => ({
  code: p?.code || '',
  name: p?.name || '',
  type: p?.type || 'ring',
  stone: p?.stone || 'none',
  color: p?.color || 'silver',
  price: p?.price ?? '',
  description: p?.description || '',
  sizes: (p?.sizes || [5, 6, 7, 8, 9, 10, 11, 12]).join(', '),
  inStock: p?.inStock ?? true,
  featured: p?.featured ?? false,
  images: p?.images || [],
  videos: p?.videos || [],
});

export default function ProductForm({ product, onCancel, onSaved }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(() => toForm(product));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [link, setLink] = useState('');
  const [uploading, setUploading] = useState('');
  const uploads = useApi('/api/uploads/status');
  const canUpload = Boolean(uploads.data?.enabled);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    set(name, type === 'checkbox' ? checked : value);
  };

  const addMedia = (url, kind) => setForm((f) => ({ ...f, [kind]: [...f[kind], url] }));
  const removeMedia = (kind, i) => setForm((f) => ({ ...f, [kind]: f[kind].filter((_, j) => j !== i) }));
  const makeCover = (i) =>
    setForm((f) => ({ ...f, images: [f.images[i], ...f.images.filter((_, j) => j !== i)] }));

  // Sends each chosen photo to /api/uploads, the server puts it on ImageKit
  // and answers with its link, which we add to the ring.
  const onUpload = async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    setError('');
    try {
      for (const [i, file] of files.entries()) {
        if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} is larger than 10 MB`);
        setUploading(`Uploading ${i + 1} of ${files.length}…`);
        const body = new FormData();
        body.append('photo', file);
        const code = encodeURIComponent(form.code.trim() || 'other');
        const res = await apiFetch(`/api/uploads?code=${code}`, { method: 'POST', body });
        addMedia(res.url, 'images');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading('');
    }
  };

  const onAddLink = () => {
    const url = link.trim();
    if (!/^https:\/\/\S+$/.test(url) && !/^\/[\w\-./]+$/.test(url)) {
      setError('A link must start with https://');
      return;
    }
    addMedia(url, looksLikeVideo(url) ? 'videos' : 'images');
    setLink('');
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const sizes = form.sizes
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (!form.code.trim() || !form.name.trim() || form.price === '') {
      setError('Code, name and price are required.');
      return;
    }
    const body = { ...form, price: Number(form.price), sizes };
    setSaving(true);
    setError('');
    try {
      if (isEdit) await api.patch(`/api/products/${product._id}`, body);
      else await api.post('/api/products', body);
      onSaved();
    } catch (err) {
      setError(err.field ? `${err.field}: ${err.message}` : err.message);
      setSaving(false);
    }
  };

  return (
    <form className="product-form" onSubmit={onSubmit} noValidate>
      <div className="form-head">
        <h2>{isEdit ? `Edit ${product.code}` : 'New ring'}</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          ← Back to list
        </button>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Code</span>
          <input name="code" value={form.code} onChange={onChange} placeholder="R21" maxLength={12} />
        </label>
        <label className="field">
          <span>Name</span>
          <input name="name" value={form.name} onChange={onChange} maxLength={100} />
        </label>
        <label className="field">
          <span>Type</span>
          <select name="type" value={form.type} onChange={onChange}>
            <option value="ring">Ring</option>
            <option value="chain">Chain</option>
            <option value="pendant">Pendant</option>
          </select>
        </label>
        <label className="field">
          <span>Price (USD)</span>
          <input name="price" type="number" min="0" step="1" value={form.price} onChange={onChange} />
        </label>
        <label className="field">
          <span>Stone</span>
          <input name="stone" list="stone-options" value={form.stone} onChange={onChange} />
          <datalist id="stone-options">
            {STONE_OPTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label className="field">
          <span>Colour</span>
          <input name="color" list="color-options" value={form.color} onChange={onChange} />
          <datalist id="color-options">
            {COLOR_OPTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="field field-wide">
          <span>Sizes (comma separated)</span>
          <input name="sizes" value={form.sizes} onChange={onChange} placeholder="5, 6, 7, 8" />
        </label>
        <label className="field field-wide">
          <span>Description</span>
          <textarea name="description" rows="4" value={form.description} onChange={onChange} maxLength={2000} />
        </label>
        <label className="check">
          <input type="checkbox" name="inStock" checked={form.inStock} onChange={onChange} /> In stock
        </label>
        <label className="check">
          <input type="checkbox" name="featured" checked={form.featured} onChange={onChange} /> Featured on the home page
        </label>
      </div>

      <fieldset className="media-editor">
        <legend>Photos</legend>
        <p className="muted small">
          The first photo is the cover.
          {canUpload
            ? ' Upload photos from your computer or phone. Remember to press Save after uploading.'
            : ' Uploads are off until IMAGEKIT_PRIVATE_KEY is in server/.env. You can still add a photo by link.'}
        </p>

        <div className="media-list">
          {form.images.map((src, i) => (
            <div key={src} className="media-item">
              <img src={sized(src, 240)} alt="" />
              <div className="media-item-actions">
                {i > 0 && (
                  <button type="button" onClick={() => makeCover(i)}>
                    Cover
                  </button>
                )}
                <button type="button" onClick={() => removeMedia('images', i)} aria-label="Remove photo">
                  ✕
                </button>
              </div>
              {i === 0 && <span className="media-cover">Cover</span>}
            </div>
          ))}
          {form.videos.map((src, i) => (
            <div key={src} className="media-item">
              <video src={src} muted playsInline preload="metadata" />
              <div className="media-item-actions">
                <button type="button" onClick={() => removeMedia('videos', i)} aria-label="Remove video">
                  ✕
                </button>
              </div>
              <span className="media-cover">Video</span>
            </div>
          ))}
          {!form.images.length && !form.videos.length && <p className="muted small">No media yet.</p>}
        </div>

        <div className="media-add">
          <label className={`btn btn-primary btn-sm upload-btn ${canUpload && !uploading ? '' : 'is-disabled'}`}>
            {uploading || 'Upload photos'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={onUpload}
              disabled={!canUpload || Boolean(uploading)}
              hidden
            />
          </label>
          <div className="media-link">
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="…or paste a photo link (https://…)" />
            <button type="button" className="btn btn-ghost btn-sm" onClick={onAddLink}>
              Add link
            </button>
          </div>
        </div>
      </fieldset>

      {error && (
        <p className="notice notice-warn" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving || Boolean(uploading)}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create ring'}
        </button>
      </div>
    </form>
  );
}
