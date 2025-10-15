import React from 'react';
import './CatBackground.css';

function createCatVideo(index) {
  return (
    <video
      className={`cat-background__cat cat-background__cat--${index}`}
      muted
      loop
      autoPlay
      playsInline
      preload="none"
    >
      <source src="/assets/images/cat.webm" type="video/webm" />
      <img src="/assets/images/cat.gif" alt="" loading="lazy" decoding="async" fetchPriority="low" />
    </video>
  );
}

export default function CatBackground() {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const stars = el.querySelector('.cat-background__stars');
    const nebula = el.querySelector('.cat-background__nebula');
    const cats = Array.from(el.querySelectorAll('.cat-background__cat'));

    let ticking = false;
    let mouseX = 0;
    let mouseY = 0;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        if (stars) {
          const sTranslate = Math.min(30, y * 0.02);
          stars.style.transform = `translateY(${sTranslate}px)`;
        }
        if (nebula) {
          const nTranslate = Math.min(60, y * 0.05);
          const nScale = 1 + Math.min(0.12, y * 0.00025);
          const nParallaxX = (mouseX - window.innerWidth / 2) * 0.0008;
          const nParallaxY = (mouseY - window.innerHeight / 2) * 0.0006;
          nebula.style.transform = `translate(${nParallaxX * 40}px, ${nTranslate + nParallaxY * 30}px) scale(${nScale})`;
        }
        if (cats.length) {
          cats.forEach((node, idx) => {
            const speed = 0.035 + idx * 0.012;
            const cTranslateY = Math.min(80, y * speed);
            const swayX = Math.sin((y + idx * 120) * 0.002) * 10;
            const mouseParX = (mouseX - window.innerWidth / 2) * (0.0005 + idx * 0.0001);
            const mouseParY = (mouseY - window.innerHeight / 2) * (0.0004 + idx * 0.00008);
            node.style.transform = `translate(${swayX + mouseParX * 35}px, ${cTranslateY + mouseParY * 25}px)`;
          });
        }
        ticking = false;
      });
    };

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!ticking) onScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const showCats = React.useMemo(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData =
      typeof navigator !== 'undefined' &&
      navigator.connection &&
      navigator.connection.saveData;
    return !(prefersReducedMotion || saveData);
  }, []);

  return (
    <div className="cat-background" ref={containerRef}>
      <div className="cat-background__stars"></div>
      <div className="cat-background__nebula"></div>
      <div className="cat-background__floating-cats">
        {showCats ? (
          <>
            {createCatVideo(1)}
            {createCatVideo(2)}
            {createCatVideo(3)}
            {createCatVideo(4)}
          </>
        ) : null}
      </div>
    </div>
  );
}
