/* © 2026 Eden Jewelry. All rights reserved. */
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import RingPlaceholder from './RingPlaceholder.jsx';
import { formatPrice, stoneLabel, capitalize } from '../utils/format.js';
import { sized } from '../utils/image.js';

export default function ProductCard({ product }) {
  const videoRef = useRef(null);
  const cover = product.images?.[0];
  const video = product.videos?.[0];

  // Hover preview: play the ring's video if it has one.
  const play = () => videoRef.current?.play().catch(() => {});
  const stop = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  return (
    <article className="product-card" onMouseEnter={play} onMouseLeave={stop}>
      <Link to={`/shop/${product._id}`} className="product-card-link">
        <div className="product-media">
          {cover ? (
            <img src={sized(cover, 600)} alt={product.name} loading="lazy" />
          ) : (
            <RingPlaceholder stone={product.stone} color={product.color} label={product.name} />
          )}
          {video && (
            <video
              ref={videoRef}
              className={`product-hover-video ${cover ? '' : 'is-only'}`}
              src={video}
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
          )}
          <div className="product-badges">
            {!product.inStock && <span className="badge badge-muted">Sold out</span>}
            {video && <span className="badge">▶ Video</span>}
          </div>
        </div>
        <div className="product-info">
          <span className="product-code">{product.code}</span>
          <h3>{product.name}</h3>
          <p className="product-meta">
            {stoneLabel(product.stone)} · {capitalize(product.color)}
          </p>
          <p className="product-price">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </article>
  );
}
