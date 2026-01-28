/**
 * Hero Section - DIALAB Klinika (Section 1)
 * Design: High-impact visual with value proposition
 * Features: About Us block, credentials, trust indicators, Service Search
 * Animation: Smooth fade-in, parallax effects
 * Color: White background with soft green/blue accents
 */

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, Shield, Clock, Award, Users, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

const trustIndicators = [
  { icon: Shield, label: 'Etibarlı Nəticələr', value: '99.9%' },
  { icon: Clock, label: 'Sürətli Xidmət', value: '24 saat' },
  { icon: Award, label: 'Təcrübə', value: '15+ il' },
  { icon: Users, label: 'Xoşbəxt Pasient', value: '50K+' },
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
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-[#f0fdf4] to-[#e8f4fc]"
    >
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#00b982]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#14b8a6]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00b982]/5 to-[#1a365d]/5 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-4 lg:px-8 pt-28 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            style={{ opacity }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00b982]/10 text-[#00b982] text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              DIALAB Tibb Mərkəzi
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1a365d] leading-tight mb-6"
            >
              Müasir Tibbi
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b982] to-[#14b8a6]">
                Diaqnostika
              </span>
              <br />
              Xidmətləri
            </motion.h1>

            {/* Description - About Us */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed"
            >
              500+ növ laboratoriya testi və müasir diaqnostika avadanlıqları ilə 
              sağlamlığınızı dəqiq və etibarlı şəkildə qiymətləndiririk. 15 ildən artıq 
              təcrübə ilə Azərbaycanda tibbi xidmət standartlarını müəyyən edirik.
            </motion.p>

            {/* Service Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative mb-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Xidmət və ya test axtarın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border-2 border-gray-100 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 transition-all duration-300 text-gray-700 placeholder:text-gray-400 shadow-lg shadow-black/5"
                />
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20"
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

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                onClick={() => scrollToSection('appointment')}
                className="px-8 py-4 bg-gradient-to-r from-[#00b982] to-[#14b8a6] text-white font-semibold rounded-xl shadow-lg shadow-[#00b982]/25 hover:shadow-xl hover:shadow-[#00b982]/30 transition-all duration-300 flex items-center gap-2 group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Randevu Al
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('laboratory')}
                className="px-8 py-4 bg-white text-[#1a365d] font-semibold rounded-xl border-2 border-gray-200 hover:border-[#00b982] hover:text-[#00b982] transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Xidmətlərimiz
              </motion.button>
            </motion.div>

            {/* Trust Indicators - Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="hidden lg:flex items-center gap-6 mt-10 pt-8 border-t border-gray-200"
            >
              {trustIndicators.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00b982]/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#00b982]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1a365d]">{item.value}</div>
                    <div className="text-xs text-gray-500">{item.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image & Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Main Image */}
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <img
                src="/images/hero-medical-lab.jpg"
                alt="DIALAB Laboratoriya"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a365d]/60 via-transparent to-transparent" />
              
              {/* Floating Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00b982] to-[#14b8a6] flex items-center justify-center">
                    <img src="/images/dia_logo_symbol.png" alt="Logo" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a365d]">DIALAB Klinika</h3>
                    <p className="text-sm text-gray-500">Laboratoriya & Diaqnostika</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#00b982]">500+</div>
                    <div className="text-xs text-gray-500">Test</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#00b982]">15+</div>
                    <div className="text-xs text-gray-500">İl</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#00b982]">50K+</div>
                    <div className="text-xs text-gray-500">Pasient</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#00b982]">24/7</div>
                    <div className="text-xs text-gray-500">Dəstək</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#00b982]/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#14b8a6]/20 rounded-full blur-2xl" />
            
            {/* Floating Discount Badge */}
            <motion.div
              className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-[#dc2626] to-[#ef4444] rounded-2xl shadow-xl shadow-red-500/30 flex items-center justify-center"
              animate={{ y: [-5, 5, -5], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-white font-bold text-xl">%20</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Trust Indicators - Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 lg:hidden"
        >
          <div className="grid grid-cols-2 gap-4">
            {trustIndicators.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-4 shadow-lg shadow-black/5 flex items-center gap-3"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="w-10 h-10 rounded-lg bg-[#00b982]/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#00b982]" />
                </div>
                <div>
                  <div className="font-bold text-[#1a365d]">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-[#00b982]/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1.5 h-3 bg-[#00b982] rounded-full"
          />
        </motion.div>
      </motion.div>
      
      {/* Volumetric Section Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#00b982]/5 to-[#f0fdf4] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00b982]/30 to-transparent" />
    </section>
  );
}
