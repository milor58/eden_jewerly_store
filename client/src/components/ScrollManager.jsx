import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToTop } from '../lib/smooth.js';

// On every page change: jump to the top and recompute scroll animations.
export default function ScrollManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToTop();
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
