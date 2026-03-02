import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Users, Microscope } from 'lucide-react';

const galleryItems = [
  {
    id: 1,
    src: '/images/hero-medical-lab.jpg',
    title: 'Müasir Laboratoriya',
    description: 'Yüksək dəqiqlikli analiz avadanlıqları və beynəlxalq standartlara uyğun nəticələr.',
  },
  {
    id: 2,
    src: '/images/diagnostics-ultrasound.jpg',
    title: 'Diaqnostika Mərkəzi',
    description: 'USM və digər instrumental diaqnostika xidmətləri ilə erkən aşkarlama imkanı.',
  },
  {
    id: 3,
    src: '/images/doctor-consultation.jpg',
    title: 'Peşəkar Komanda',
    description: 'Təcrübəli həkimlər və pasient mərkəzli tibbi yanaşma ilə etibarlı xidmət.',
  },
  {
    id: 4,
    src: '/images/lab-analysis.jpg',
    title: 'Dəqiq Nəticələr',
    description: 'Sürətli və etibarlı cavablarla müalicə qərarlarının düzgün verilməsi.',
  },
];

const aboutStats = [
  {
    icon: Microscope,
    value: '500+',
    label: 'Laboratoriya testləri',
  },
  {
    icon: Users,
    value: '50K+',
    label: 'Xoşbəxt pasient',
  },
  {
    icon: Award,
    value: '15+ il',
    label: 'Sahə təcrübəsi',
  },
];

export default function MediaGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % galleryItems.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <motion.section
      id="gallery"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
      className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-white via-[#f0fdf4] to-[#e8f4fc] border-t-2 border-[#00b982]/30"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-[#00b982]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#14b8a6]/8 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl flex flex-col justify-between"
          >
            <p className="uppercase tracking-[0.22em] text-sm font-medium text-[#00b982]">Haqqımızda</p>
            <h2 className="mt-2 text-4xl md:text-5xl font-extrabold text-[#1a365d] leading-tight">
              Bizim Hekayəmiz
            </h2>

            <p className="mt-7 text-lg text-gray-600 leading-relaxed">
              Dialab Klinika olaraq məqsədimiz müasir laboratoriya və diaqnostika xidmətlərini
              yüksək keyfiyyətlə təqdim etməkdir. Pasient məmnuniyyəti, dəqiqlik və etibarlılıq
              gündəlik fəaliyyətimizin əsas prioritetidir.
            </p>

            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              Komandamız peşəkar mütəxəssislərdən ibarətdir və hər bir müraciətə fərdi yanaşma
              göstərir. Texnoloji imkanlarımız sayəsində nəticələri sürətli və şəffaf şəkildə
              təqdim edirik.
            </p>

            <div className="mt-10 border-y border-[#00b982]/20 divide-y divide-[#00b982]/20">
              {aboutStats.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#00b982]/12 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-[#00b982]" />
                    </div>
                    <span className="text-xl font-bold text-[#1a365d]">{item.value}</span>
                  </div>
                  <span className="text-gray-600 text-base md:text-lg">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#00b982]/20 shadow-xl shadow-black/10 flex-1 min-h-[380px] bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={galleryItems[currentIndex].id}
                  initial={{ opacity: 0, x: 45 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -45 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  <img
                    src={galleryItems[currentIndex].src}
                    alt={galleryItems[currentIndex].title}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      {galleryItems[currentIndex].title}
                    </h3>
                    <p className="mt-2 text-white/90 text-sm md:text-base leading-relaxed">
                      {galleryItems[currentIndex].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>

            <div className="flex justify-center gap-2.5 mt-4">
              {galleryItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Şəkil ${index + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? 'w-7 bg-[#00b982]' : 'w-2 bg-[#1a365d]/25 hover:bg-[#1a365d]/45'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
