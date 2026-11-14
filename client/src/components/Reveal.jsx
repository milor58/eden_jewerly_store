import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/smooth.js';

gsap.registerPlugin(ScrollTrigger);

// Fades and lifts its content in when it scrolls into view.
export default function Reveal({ as: Tag = 'div', delay = 0, y = 40, children, ...rest }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y,
        opacity: 0,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
      });
    });
    return () => ctx.revert();
  }, [delay, y]);

  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
