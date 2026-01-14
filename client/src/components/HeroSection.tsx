/**
 * Hero Section - DIALAB Klinika
 * Design: Full-width parallax hero with 3D slider effect
 * Features: Parallax background, animated text, floating elements
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Shield, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    id: 1,
    image: '/images/hero-medical-lab.jpg',
    title: 'Müasir Laboratoriya',
    subtitle: 'Testləri',
    description: 'Ən son texnologiya ilə təchiz olunmuş laboratoriyamızda 500+ növ test aparılır.',
  },
  {
    id: 2,
    image: '/images/diagnostics-ultrasound.jpg',
    title: 'Dəqiq Diaqnostika',
    subtitle: 'Xidmətləri',
    description: 'USM, EKQ, Exokardioqrafiya və digər müasir diaqnostika metodları.',
  },
  {
    id: 3,
    image: '/images/doctor-consultation.jpg',
    title: 'Peşəkar Həkim',
    subtitle: 'Məsləhətləri',
    description: 'Təcrübəli mütəxəssislərimizdən fərdi yanaşma və keyfiyyətli müalicə.',
  },
];

const features = [
  { icon: Shield, text: 'Etibarlı Nəticələr' },
  { icon: Clock, text: 'Sürətli Xidmət' },
  { icon: Award, text: '15+ İl Təcrübə' },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const scrollToAppointment = () => {
    const element = document.getElementById('appointment');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Parallax Background Slides */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <AnimatePresence mode="wait">
          {slides.map((slide, index) => (
            index === currentSlide && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 container min-h-screen flex items-center pt-20"
        style={{ opacity }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full py-12">
          {/* Left Content */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 border border-teal-400/30 backdrop-blur-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-teal-300 font-medium text-sm">DIALAB Tibb Mərkəzi</span>
                </motion.div>

                {/* Title */}
                <h1 className="font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl text-white leading-tight">
                  {slides[currentSlide].title}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                    {slides[currentSlide].subtitle}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed">
                  {slides[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                onClick={scrollToAppointment}
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-300 group"
              >
                Randevu Al
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const element = document.getElementById('laboratory');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-2 border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/50 font-semibold px-8 py-6 rounded-xl transition-all duration-300"
              >
                Xidmətlərimiz
              </Button>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 pt-4"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-slate-300">
                  <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">{feature.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - 3D Card Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Main 3D Card */}
              <motion.div
                className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                }}
                animate={{
                  rotateY: [-2, 2, -2],
                  rotateX: [1, -1, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                      <img src="/images/dia_logo_symbol.png" alt="DIALAB" className="w-10 h-10 object-contain" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xl text-white">DIALAB Klinika</h3>
                      <p className="text-teal-300 text-sm">Laboratoriya & Diaqnostika</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-3xl font-bold text-white">500+</p>
                      <p className="text-slate-400 text-sm">Test Növü</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-3xl font-bold text-white">15+</p>
                      <p className="text-slate-400 text-sm">İl Təcrübə</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-3xl font-bold text-white">50K+</p>
                      <p className="text-slate-400 text-sm">Xoşbəxt Pasient</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-3xl font-bold text-white">24/7</p>
                      <p className="text-slate-400 text-sm">Dəstək</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-coral-400 to-red-500 rounded-2xl shadow-xl shadow-red-500/30 flex items-center justify-center"
                animate={{ y: [-5, 5, -5], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-white font-bold text-2xl">%20</span>
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 px-4 py-2 bg-white rounded-xl shadow-xl"
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <p className="text-teal-600 font-semibold text-sm">İlk vizit endirimi!</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Slide Navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="container flex items-center justify-between">
          {/* Slide Indicators */}
          <div className="flex gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentSlide(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-teal-400'
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Arrow Navigation */}
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-3 rounded-full bg-teal-400"
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
