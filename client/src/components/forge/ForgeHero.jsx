import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ForgeScene from './ForgeScene.jsx';
import { prefersReducedMotion, scrollToElement } from '../../lib/smooth.js';
import './forge.css';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { n: '01', title: 'Melt', text: 'Pure 925 silver goes into the fire and melts at 961 °C.' },
  { n: '02', title: 'Pour', text: 'The glowing silver is poured into the ring mould.' },
  { n: '03', title: 'Forge', text: 'Strike after strike, the ring takes its shape by hand.' },
  { n: '04', title: 'Set', text: 'The stone is set and polished. A new ring is born.' },
];

const SHOULDER = '900 445'; // the hammer arm turns around this point
const STRIKES = [6.6, 7.4, 8.2]; // timeline times of the three hammer blows

// Wide screens: fill the screen. Tall phones: zoom on the furnace, anvil and smith.
const WIDE = { preserve: 'xMidYMax slice', viewBox: '0 0 1200 800' };
const TALL = { preserve: 'xMidYMid meet', viewBox: '95 150 900 620' };
const pickFit = () =>
  typeof window !== 'undefined' && window.innerWidth / window.innerHeight < 1.15 ? TALL : WIDE;

export default function ForgeHero() {
  const root = useRef(null);
  const [fit, setFit] = useState(pickFit);

  useEffect(() => {
    const onResize = () => setFit(pickFit());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context((self) => {
      const q = self.selector;

      // ---------- starting positions ----------
      gsap.set('.smith-arm', { rotation: -30, svgOrigin: SHOULDER });
      gsap.set('.crucible-tilt', { svgOrigin: '0 -20' });
      gsap.set('.stream', { scaleY: 0, transformOrigin: '50% 0%' });
      gsap.set('.hero-ring', { x: 650, y: 577, scale: 0.18, svgOrigin: '0 0' });
      gsap.set('.hero-gem', { y: -120, opacity: 0 });
      gsap.set('.hero-shine', { scale: 0.4, transformOrigin: '50% 50%' });
      gsap.set('.forge-caption, .forge-cta', { autoAlpha: 0, y: 24 });

      // ---------- reduced motion: show the finished ring, no scroll story ----------
      if (prefersReducedMotion()) {
        gsap.set('.forge-intro', { autoAlpha: 0 });
        gsap.set('.forge-dim', { opacity: 0.8 });
        gsap.set('.hero-ring', { opacity: 1, x: 600, y: 340, scale: 0.85 });
        gsap.set('.hero-gem', { y: 0, opacity: 1 });
        gsap.set('.forge-cta', { autoAlpha: 1, y: 0 });
        return;
      }

      // ---------- always-on fire ----------
      q('.flame').forEach((el, i) => {
        gsap.to(el, {
          scaleY: () => gsap.utils.random(0.8, 1.2),
          scaleX: () => gsap.utils.random(0.88, 1.08),
          skewX: () => gsap.utils.random(-7, 7),
          transformOrigin: '50% 100%',
          duration: () => gsap.utils.random(0.12, 0.26),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
          delay: i * 0.05,
        });
      });
      gsap.to('.furnace-inner', { opacity: 1, duration: 0.7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.furnace-glow', { opacity: 0.75, duration: 1.1, repeat: -1, yoyo: true, ease: 'sine.inOut' });

      q('.ember').forEach((el) => {
        gsap
          .timeline({ repeat: -1, repeatRefresh: true, delay: gsap.utils.random(0, 3) })
          .fromTo(el, { x: 0, y: 0, opacity: 0 }, { opacity: 1, duration: 0.25 })
          .to(
            el,
            {
              y: () => -gsap.utils.random(150, 320),
              x: () => gsap.utils.random(-60, 60),
              duration: () => gsap.utils.random(1.6, 3.2),
              ease: 'power1.out',
            },
            0
          )
          .to(el, { opacity: 0, duration: 0.8 }, '>-0.8');
      });

      // intro text comes in on page load
      gsap.from('.forge-intro > *', { y: 40, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out', delay: 0.15 });

      // ---------- the scroll story ----------
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 4.5)}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const captionIn = (i, t) => tl.to(`.forge-caption-${i}`, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, t);
      const captionOut = (i, t) => tl.to(`.forge-caption-${i}`, { autoAlpha: 0, y: -24, duration: 0.4, ease: 'power2.in' }, t);

      // intro out
      tl.to('.forge-intro', { autoAlpha: 0, y: -40, duration: 0.6 }, 0);

      // 01 MELT
      captionIn(0, 0.4);
      tl.to('.furnace-glow', { scale: 1.25, transformOrigin: '50% 60%', duration: 2 }, 0.6)
        .to('.crucible-hot', { opacity: 0.55, duration: 1.2 }, 1.0)
        .to('.bar', { scaleY: 0, transformOrigin: '50% 100%', stagger: 0.25, duration: 1.2, ease: 'power1.in' }, 0.9)
        .to('.liquid', { opacity: 1, duration: 1 }, 1.2);

      // 02 POUR
      captionOut(0, 2.6);
      captionIn(1, 2.8);
      tl.to('.crucible-chain', { opacity: 1, duration: 0.3 }, 2.6)
        .to('.crucible', { y: 480, duration: 0.5, ease: 'power2.out' }, 2.7)
        .to('.crucible', { x: 648, y: 428, duration: 1 }, 3.2)
        .to('.crucible-tilt', { rotation: 58, duration: 0.6 }, 4.2)
        .to('.stream', { opacity: 1, duration: 0.01 }, 4.6)
        .to('.stream', { scaleY: 1, duration: 0.35, ease: 'none' }, 4.6)
        .to('.mold-glow', { opacity: 1, duration: 0.6 }, 4.9)
        .to('.liquid', { opacity: 0, duration: 0.6 }, 4.9)
        .to('.stream', { opacity: 0, duration: 0.3 }, 5.4)
        .to('.crucible-tilt', { rotation: 0, duration: 0.5 }, 5.6)
        .to('.crucible', { x: 470, y: 250, opacity: 0, duration: 0.8 }, 5.9);

      // 03 FORGE
      captionOut(1, 6.0);
      captionIn(2, 6.2);
      tl.to('.mold', { y: 18, opacity: 0, duration: 0.5 }, 6.1)
        .to('.ring-cool', { opacity: 1, duration: 0.01 }, 6.1)
        .to('.ring-hot', { opacity: 1, duration: 0.3 }, 6.1)
        .to('.tongs', { opacity: 1, duration: 0.3 }, 6.3);

      STRIKES.forEach((t, i) => {
        const sparks = q(`.spark-set-${i + 1} .spark`);
        const dirs = sparks.map(() => {
          const angle = gsap.utils.random(-170, -10) * (Math.PI / 180);
          const dist = gsap.utils.random(45, 160);
          return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
        });
        tl.to('.smith-arm', { rotation: 62, duration: 0.4, ease: 'power2.out' }, t)
          .to('.smith-arm', { rotation: 0, duration: 0.14, ease: 'power3.in' }, t + 0.42)
          .set(sparks, { opacity: 1, x: 0, y: 0 }, t + 0.56)
          .to(sparks, { x: (k) => dirs[k].x, y: (k) => dirs[k].y + 30, opacity: 0, duration: 0.5, ease: 'power2.out' }, t + 0.56)
          .to('.forge-world', { x: 5, duration: 0.04, yoyo: true, repeat: 3, ease: 'none' }, t + 0.56);
      });

      tl.to('.smith-arm', { rotation: -30, duration: 0.6 }, 8.95)
        .to('.ring-hot', { opacity: 0, duration: 0.8 }, 8.9)
        .to(
          '.steam-puff',
          {
            keyframes: { opacity: [0, 0.45, 0], y: [0, -40, -95], scale: [0.6, 1.2, 1.8] },
            transformOrigin: '50% 50%',
            duration: 1,
            stagger: 0.12,
            ease: 'none',
          },
          8.9
        )
        .to('.tongs', { opacity: 0, duration: 0.3 }, 9.4);

      // 04 SET
      captionOut(2, 9.6);
      captionIn(3, 9.8);
      tl.to('.forge-dim', { opacity: 0.8, duration: 0.8 }, 9.7)
        .to('.ring-cool', { opacity: 0, duration: 0.3 }, 9.9)
        .to('.hero-ring', { opacity: 1, duration: 0.2 }, 9.85)
        .to('.hero-ring', { x: 600, y: 390, scale: 1, duration: 1.1, ease: 'power3.inOut' }, 9.85)
        .to('.hero-gem', { y: 0, opacity: 1, duration: 0.6, ease: 'bounce.out' }, 10.9)
        .to('.hero-shine', { opacity: 1, scale: 1.4, rotation: 45, duration: 0.3, stagger: 0.15 }, 11.4)
        .to('.hero-shine', { opacity: 0, scale: 0.6, duration: 0.3, stagger: 0.15 }, 11.75);

      // final call to action
      captionOut(3, 12.0);
      tl.to('.hero-ring', { y: 330, scale: 0.82, duration: 0.6 }, 12.0)
        .to('.forge-cta', { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 12.1)
        .to({}, { duration: 0.6 }); // short hold before the page continues

      tl.fromTo('.forge-progress span', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: tl.duration() }, 0);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="forge" ref={root} aria-label="How an Eden ring is made">
      <div className="forge-stage">
        <ForgeScene preserve={fit.preserve} viewBox={fit.viewBox} />

        <div className="forge-intro">
          <p className="eyebrow">Handmade in south Lebanon</p>
          <h1>
            Eden <em>Jewelry</em>
          </h1>
          <p className="forge-lead">Silver rings melted, poured and hammered by hand in a small family workshop.</p>
          <span className="forge-hint">
            Scroll to light the forge <span aria-hidden="true">↓</span>
          </span>
        </div>

        <div className="forge-captions">
          {STEPS.map((s, i) => (
            <div key={s.n} className={`forge-caption forge-caption-${i}`}>
              <span className="forge-step">{s.n}</span>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
            </div>
          ))}
        </div>

        <div className="forge-cta">
          <h2>Every ring is born in fire.</h2>
          <p>Browse the collection, pick your size and send an order request. We deliver across Lebanon.</p>
          <div className="forge-cta-actions">
            <Link to="/shop" className="btn btn-primary">
              Explore the collection
            </Link>
            <button type="button" className="btn btn-ghost" onClick={() => scrollToElement(document.getElementById('how'))}>
              How ordering works
            </button>
          </div>
        </div>

        <div className="forge-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
