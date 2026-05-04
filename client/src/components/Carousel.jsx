import { useEffect, useState } from 'react';
import './Carousel.css';

export function Carousel({ slides, intervalMs = 5000 }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!slides?.length) return undefined;
    const t = setInterval(() => {
      setI((v) => (v + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [slides, intervalMs]);

  if (!slides?.length) {
    return <div className="carousel carousel-empty">Cargando destacados…</div>;
  }

  const slide = slides[i];

  return (
    <div className="carousel">
      <div
        className="carousel-slide"
        style={{ backgroundImage: `url(${slide.image})` }}
        role="img"
        aria-label={slide.name}
      >
        <div className="carousel-caption">
          <h2>{slide.name}</h2>
          <p>{slide.tagline}</p>
        </div>
      </div>
      <div className="carousel-dots">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={idx === i ? 'active' : ''}
            onClick={() => setI(idx)}
            aria-label={`Ir a promoción ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
