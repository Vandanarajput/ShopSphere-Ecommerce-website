import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * HeroCarousel — split-layout banner (text left, image right).
 *
 * slides[]: { subtitle, title, description?, cta?, ctaLink?, cta2?, cta2Link?, image?, gradient? }
 */
export default function HeroCarousel({ slides, interval = 3500 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [paused, interval, slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-sm bg-stone-50"
      style={{ minHeight: '560px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <Slide key={i} slide={slide} active={i === index} index={index} setIndex={setIndex} total={slides.length} />
      ))}
    </div>
  );
}

function Slide({ slide, active, index, setIndex, total }) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ${
        active ? 'opacity-100 z-[1]' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="grid md:grid-cols-[6fr_5fr] h-full"
        style={{ backgroundColor: '#F8F2EC', minHeight: '560px' }}
      >
        {/* LEFT — text content */}
        <div className="flex items-center px-8 md:px-14 py-12">
          <div className="max-w-md">
            {slide.subtitle && (
              <p className="text-xs md:text-sm tracking-[0.25em] uppercase text-stone-500 mb-3">
                {slide.subtitle}
              </p>
            )}
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 leading-tight mb-4">
              {slide.title}
            </h2>
            {slide.description && (
              <p className="text-stone-600 text-base md:text-lg mb-6 leading-relaxed">
                {slide.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {slide.cta && (
                <Link
                  to={slide.ctaLink || '/products'}
                  className="px-7 py-3 rounded-full text-sm font-semibold text-white hover:opacity-90 transition shadow-sm inline-flex items-center gap-2"
                  style={{ backgroundColor: '#3D4D2E' }}
                >
                  {slide.cta} <span aria-hidden>→</span>
                </Link>
              )}
              {slide.cta2 && (
                <Link
                  to={slide.cta2Link || '/products'}
                  className="px-7 py-3 rounded-full text-sm font-semibold bg-white border hover:bg-stone-50 transition"
                  style={{ color: '#3D4D2E', borderColor: '#3D4D2E' }}
                >
                  {slide.cta2}
                </Link>
              )}
            </div>

            {/* Dot indicators */}
            {total > 1 && (
              <div className="flex gap-2 mt-8 items-center">
                {Array.from({ length: total }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all ${
                      i === index ? 'w-10' : 'w-2.5 bg-stone-300 hover:bg-stone-500'
                    }`}
                    style={i === index ? { backgroundColor: '#3D4D2E' } : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — image with blurred-fill backdrop */}
        <div className="relative overflow-hidden bg-stone-200">
          {slide.image ? (
            <>
              {/* Blurred copy of same image fills empty space behind */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  filter: 'blur(60px) saturate(1.2)',
                  transform: 'scale(1.4)',
                }}
              />
              {/* Soft tint over the blur for elegance */}
              <div className="absolute inset-0 bg-white/30" />
              {/* The actual sharp image on top */}
              <img
                src={slide.image}
                alt={slide.title}
                className="relative w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </>
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${slide.gradient || 'from-stone-200 to-stone-400'}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
