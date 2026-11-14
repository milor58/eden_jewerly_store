import { useState } from 'react';
import RingPlaceholder from './RingPlaceholder.jsx';
import { sized } from '../utils/image.js';

// Photos first, then videos. Not every ring has a video.
export default function MediaGallery({ product }) {
  const media = [
    ...(product.images || []).map((src) => ({ type: 'image', src })),
    ...(product.videos || []).map((src) => ({ type: 'video', src })),
  ];
  const [active, setActive] = useState(0);
  const index = Math.min(active, Math.max(media.length - 1, 0));
  const current = media[index];

  if (!media.length) {
    return (
      <div className="gallery">
        <div className="gallery-main">
          <RingPlaceholder stone={product.stone} color={product.color} label={product.name} />
        </div>
        <p className="gallery-note">Real photos of this ring are coming soon.</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      <div className="gallery-main">
        {current.type === 'image' ? (
          <img key={current.src} src={sized(current.src, 1200)} alt={`${product.name} photo ${index + 1}`} />
        ) : (
          <video key={current.src} src={current.src} controls playsInline autoPlay muted loop preload="metadata" />
        )}
      </div>
      {media.length > 1 && (
        <div className="gallery-thumbs" role="list">
          {media.map((m, i) => (
            <button
              key={m.src}
              type="button"
              role="listitem"
              className={`gallery-thumb ${i === index ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={m.type === 'video' ? `Play video ${i + 1}` : `Show photo ${i + 1}`}
            >
              {m.type === 'image' ? (
                <img src={sized(m.src, 160)} alt="" loading="lazy" />
              ) : (
                <>
                  <video src={m.src} muted preload="metadata" playsInline />
                  <span className="gallery-play" aria-hidden="true">▶</span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
