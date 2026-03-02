import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import CompactAppointmentForm from './CompactAppointmentForm';

interface HeroSlideItem {
  id: string;
  image: string;
  alt: string;
}

const heroSlides: HeroSlideItem[] = [
  {
    id: 'slide-lab',
    image: '/images/hero-medical-lab.jpg',
    alt: 'Laboratoriya avadanlıqları',
  },
  {
    id: 'slide-usm',
    image: '/images/diagnostics-ultrasound.jpg',
    alt: 'Diaqnostika müayinəsi',
  },
  {
    id: 'slide-doctor',
    image: '/images/doctor-consultation.jpg',
    alt: 'Həkim konsultasiyası',
  },
];

const popularServices = [
  'Qanın ümumi analizi',
  'Hormon testləri',
  'USM müayinəsi',
  'EKQ',
  'Hepatit testləri',
  'Vitamin D',
  'Biokimyəvi analizlər',
  'Onkomarkerlər',
];

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setActiveSlideIndex(prev => (prev + 1) % heroSlides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const filteredServices = popularServices.filter(service =>
    service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - headerHeight, behavior: 'smooth' });
    }
    setShowSuggestions(false);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroSlides[activeSlideIndex].id}
            initial={{ opacity: 0, y: '10%' }}
            animate={{ opacity: 1, y: '0%' }}
            exit={{ opacity: 0, y: '-10%' }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <img
              src={heroSlides[activeSlideIndex].image}
              alt={heroSlides[activeSlideIndex].alt}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-br from-white/82 via-[#f0fdf4]/74 to-[#e8f4fc]/70" />
        <div className="absolute inset-0 bg-white/12" />
      </div>

      <div className="absolute right-4 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setActiveSlideIndex(index)}
            aria-label={`Slayd ${index + 1}`}
            className={`w-2 rounded-full transition-all duration-300 ${
              index === activeSlideIndex ? 'h-8 bg-[#00b982]' : 'h-2 bg-[#1a365d]/25 hover:bg-[#1a365d]/40'
            }`}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-28 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#1a365d] leading-tight mb-8"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a365d] via-[#00b982] to-[#14b8a6]">
                Dialab
                <br />
                Tibb Mərkəzi
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-700 mb-10 max-w-lg leading-relaxed font-medium"
            >
              500+ növ laboratoriya testi və müasir diaqnostika avadanlıqları ilə
              sağlamlığınızı dəqiq və etibarlı şəkildə qiymətləndiririk. 15 ildən artıq
              təcrübə ilə Azərbaycanda tibbi xidmət standartlarını müəyyən edirik.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Xidmət və ya test axtarın..."
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border-2 border-gray-100 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 transition-all duration-300 text-gray-700 placeholder:text-gray-400 shadow-lg shadow-black/5"
                />
              </div>

              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-30"
                >
                  <div className="p-3 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Populyar Xidmətlər
                    </span>
                  </div>
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {filteredServices.map((service, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(service);
                          scrollToSection('laboratory');
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#00b982]/10 text-gray-700 hover:text-[#00b982] transition-colors flex items-center justify-between group"
                      >
                        <span>{service}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative max-w-sm lg:max-w-md mx-auto lg:ml-auto w-full"
          >
            <CompactAppointmentForm />
          </motion.div>
        </div>
      </div>

      <button
        onClick={() => scrollToSection('gallery')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 h-12 w-7 rounded-full border-2 border-[#00b982]/38 bg-white/55 flex items-start justify-center pt-2 hover:border-[#00b982]/60 transition-colors"
        aria-label="Aşağı keç"
      >
        <motion.span
          className="w-1.5 h-3 rounded-full bg-[#00b982]"
          animate={{ y: [0, 10, 0], opacity: [0.95, 0.55, 0.95] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        />
      </button>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[#00b982]/5 to-[#f0fdf4] pointer-events-none" />
    </section>
  );
}
