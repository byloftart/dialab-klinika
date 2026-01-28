/**
 * Media Gallery Section - DIALAB Klinika (Section 2)
 * Design: Visual slider with video/image carousel
 * Features: Parallax scrolling, fade transitions, About Us content
 * Animation: Smooth transitions, 3D card effects
 */

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Building2, Users2, Award, Target } from 'lucide-react';

const galleryItems = [
  {
    id: 1,
    type: 'image',
    src: '/images/hero-medical-lab.jpg',
    title: 'Müasir Laboratoriya',
    description: 'Ən son texnologiya ilə təchiz olunmuş laboratoriya avadanlıqları',
  },
  {
    id: 2,
    type: 'image',
    src: '/images/diagnostics-ultrasound.jpg',
    title: 'Diaqnostika Mərkəzi',
    description: 'USM və digər müasir diaqnostika cihazları',
  },
  {
    id: 3,
    type: 'image',
    src: '/images/doctor-consultation.jpg',
    title: 'Peşəkar Komanda',
    description: 'Təcrübəli həkimlər və tibb personalı',
  },
  {
    id: 4,
    type: 'image',
    src: '/images/lab-analysis.jpg',
    title: 'Dəqiq Analizlər',
    description: 'Beynəlxalq standartlara uyğun test nəticələri',
  },
];

const aboutFeatures = [
  {
    icon: Building2,
    title: 'Missiyamız',
    description: 'Azərbaycanda tibbi diaqnostika xidmətlərinin keyfiyyətini yüksəltmək və hər kəsə əlçatan etmək.',
    number: '01',
  },
  {
    icon: Target,
    title: 'Vizyonumuz',
    description: 'Regionda ən etibarlı və müasir tibbi diaqnostika mərkəzi olmaq.',
    number: '02',
  },
  {
    icon: Users2,
    title: 'Dəyərlərimiz',
    description: 'Dəqiqlik, etibarlılıq, pasient məmnuniyyəti və peşəkarlıq.',
    number: '03',
  },
  {
    icon: Award,
    title: 'Keyfiyyət',
    description: 'ISO sertifikatlı laboratoriya və beynəlxalq akkreditasiya standartları.',
    number: '04',
  },
];

export default function MediaGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  return (
    <motion.section
      id="gallery"
      ref={sectionRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-white via-[#f0fdf4] to-[#e8f4fc]"
    >
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#00b982]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#14b8a6]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00b982]/5 to-[#1a365d]/5 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-[#00b982]/20 text-[#00b982] text-sm font-medium mb-4">
            Haqqımızda
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1a365d] mb-6">
            DIALAB <span className="text-[#00b982]">Tibb Mərkəzi</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            2009-cu ildən bəri Azərbaycanda tibbi diaqnostika sahəsində xidmət göstəririk
          </p>
        </motion.div>

        {/* Gallery Slider */}
        <motion.div
          style={{ opacity }}
          className="relative mb-20"
        >
          <div className="relative rounded-3xl overflow-hidden aspect-[16/9] max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <motion.img
                  src={galleryItems[currentIndex].src}
                  alt={galleryItems[currentIndex].title}
                  className="w-full h-full object-cover"
                  style={{ y }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-3xl font-bold text-white mb-2"
                  >
                    {galleryItems[currentIndex].title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-300 text-lg"
                  >
                    {galleryItems[currentIndex].description}
                  </motion.p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all flex items-center justify-center"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-3 mt-6">
            {galleryItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-[#00b982]'
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* About Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aboutFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-6 border border-[#00b982]/20 hover:border-[#00b982]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00b982]/10"
            >
              {/* Number */}
              <span className="absolute top-4 right-4 text-4xl font-bold text-[#00b982]/10 group-hover:text-[#00b982]/20 transition-colors">
                {feature.number}
              </span>
              
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#00b982]/20 flex items-center justify-center mb-4 group-hover:bg-[#00b982]/30 transition-colors">
                <feature.icon className="w-6 h-6 text-[#00b982]" />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-bold text-[#1a365d] mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              
              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00b982]/0 to-[#00b982]/0 group-hover:from-[#00b982]/5 group-hover:to-transparent transition-all duration-300" />
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-[#00b982]/20"
        >
          {[
            { value: '500+', label: 'Test Növü' },
            { value: '15+', label: 'İl Təcrübə' },
            { value: '50K+', label: 'Xoşbəxt Pasient' },
            { value: '20+', label: 'Mütəxəssis Həkim' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#00b982] mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
