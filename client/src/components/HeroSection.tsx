import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc';

const DEFAULT_SLIDES = [
  { id: 'slide-1', image: '/images/hero/slide1.jpg', alt: 'Tibbi komanda', label: 'Peşəkar Komanda' },
  { id: 'slide-2', image: '/images/hero/slide2.jpg', alt: 'Müasir klinika', label: 'Müasir Klinika' },
  { id: 'slide-3', image: '/images/hero/slide3.jpg', alt: 'Laboratoriya', label: 'Laboratoriya Xidmətləri' },
];

export default function HeroSection() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  
  const { data: settings } = trpc.cms.settings.getGroup.useQuery({ group: 'hero' });
  
  const getSetting = (key: string, defaultValue: string) => {
    return settings?.find(s => s.key === key)?.value || defaultValue;
  };

  const badge = getSetting('hero.badge', 'Dialab Tibb Mərkəzi');
  const title1 = getSetting('hero.title1', 'Sağlamlığınız —');
  const title2 = getSetting('hero.title2', 'Bizim Prioritet');
  const subtitle = getSetting('hero.subtitle', '500+ növ laboratoriya testi və müasir diaqnostika avadanlıqları ilə sağlamlığınızı dəqiq və etibarlı şəkildə qiymətləndiririk.');

  const heroSlides = [
    { id: 'slide-1', image: getSetting('hero.slide1', '/images/hero/slide1.jpg'), alt: 'Tibbi komanda', label: 'Peşəkar Komanda' },
    { id: 'slide-2', image: getSetting('hero.slide2', '/images/hero/slide2.jpg'), alt: 'Müasir klinika', label: 'Müasir Klinika' },
    { id: 'slide-3', image: getSetting('hero.slide3', '/images/hero/slide3.jpg'), alt: 'Laboratoriya', label: 'Laboratoriya Xidmətləri' },
  ];

  const next = useCallback(() => setIdx(p => (p + 1) % heroSlides.length), [heroSlides.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [paused, next]);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ height: '82vh', minHeight: '520px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background slider ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${heroSlides[idx].id}-${heroSlides[idx].image}`}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <img
              src={heroSlides[idx].image}
              alt={heroSlides[idx].alt}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Light overlay — keeps everything bright & airy */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/40 to-white/20" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="max-w-2xl"
          >
            {/* Badge */}
            <span className="inline-block bg-[#00b982] text-white text-xs font-bold uppercase tracking-[0.18em] px-4 py-1.5 rounded-full mb-6">
              {badge}
            </span>

            {/* Heading — dark text on light overlay */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-light leading-[1.1] text-gray-900 mb-2">
              {title1}
            </h1>
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.1] text-gray-900 mb-6">
              <span className="text-[#00b982]">{title2.split(' ')[0]}</span> {title2.split(' ').slice(1).join(' ')}
            </h1>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-lg mb-6">
              {subtitle}
            </p>

            {/* Slide label */}
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3"
              >
                <span className="w-6 h-[2px] bg-[#00b982]" />
                <span className="text-gray-400 text-xs uppercase tracking-[0.2em] font-medium">
                  {heroSlides[idx].label}
                </span>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* ── Dot navigation — left ── */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {heroSlides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIdx(i)}
            aria-label={`Slayd ${i + 1}`}
            className="group"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === idx
                  ? 'w-3 h-3 bg-[#00b982] shadow-md shadow-[#00b982]/30'
                  : 'w-2.5 h-2.5 bg-gray-400/40 group-hover:bg-[#00b982]/50'
              }`}
            />
          </button>
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-200/50 z-20">
        <motion.div
          key={`p-${idx}`}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: paused ? 0 : 6, ease: 'linear' }}
          className="h-full bg-[#00b982]"
        />
      </div>
    </section>
  );
}
