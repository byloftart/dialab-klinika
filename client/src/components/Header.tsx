/**
 * Header Component - DIALAB Klinika
 * Design: Modern medical with 3D depth effects
 * Features: Sticky navigation, logo hover effect, soft green/blue glow on nav items
 * Sections: 6 distinct sections with smooth scroll
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { id: 'hero', label: 'Ana Səhifə', href: '#hero' },
  { id: 'gallery', label: 'Haqqımızda', href: '#gallery' },
  { id: 'laboratory', label: 'Laboratoriya', href: '#laboratory' },
  { id: 'diagnostics', label: 'Diaqnostika', href: '#diagnostics' },
  { id: 'appointment', label: 'Məlumat', href: '#appointment' },
  { id: 'contact', label: 'Əlaqə', href: '#contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Update active section based on scroll position
      const sections = navItems.map(item => item.id);
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - headerHeight, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'top-3 mx-4 lg:mx-8 rounded-2xl bg-white/60 backdrop-blur-xl shadow-[0_8px_32px_-4px_rgba(0,0,0,0.08)] border border-white/50'
          : 'top-0 bg-white/70 backdrop-blur-sm border-b border-gray-100/40'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? 'h-20' : 'h-24'}`}>
          {/* Logo */}
          <motion.a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="relative">
              <motion.img
                src="/images/dia_logo_symbol.png"
                alt="DIALAB Logo"
                className="h-16 w-16 object-contain"
                whileHover={{ 
                  filter: 'drop-shadow(0 0 12px rgba(0, 185, 130, 0.6))',
                }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute inset-0 bg-[#00b982]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl text-[#dc2626] leading-tight tracking-tight">
                DIALAB
              </span>
              <span className="font-semibold text-base text-[#14b8a6] -mt-1">
                KLİNİKA
              </span>
            </div>
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <motion.a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className={`relative px-5 py-3 rounded-lg font-medium text-base transition-all duration-300 ${
                  activeSection === item.id
                    ? 'text-[#00b982]'
                    : 'text-gray-600 hover:text-[#00b982]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Glow background on hover */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#00b982]/10 to-[#14b8a6]/10"
                  initial={{ opacity: 0 }}
                  whileHover={{ 
                    opacity: 1,
                    boxShadow: '0 0 20px rgba(0, 185, 130, 0.15)'
                  }}
                  transition={{ duration: 0.3 }}
                />
                {/* Active indicator */}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg bg-[#00b982]/10 border border-[#00b982]/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </motion.a>
            ))}
          </nav>

          {/* CTA Button & Phone */}
          <div className="hidden lg:flex items-center gap-4">
            <a 
              href="tel:+994123456789" 
              className="flex items-center gap-2 text-gray-600 hover:text-[#00b982] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#00b982]/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-[#00b982]" />
              </div>
              <span className="font-medium text-sm">+994 12 345 67 89</span>
            </a>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => scrollToSection('#appointment')}
                className="bg-gradient-to-r from-[#00b982] to-[#14b8a6] hover:from-[#00a070] hover:to-[#12a090] text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-[#00b982]/25 hover:shadow-[#00b982]/40 transition-all duration-300 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Randevu Al
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-[#00b982] hover:bg-[#00b982]/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-100"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    activeSection === item.id
                      ? 'bg-[#00b982]/10 text-[#00b982]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#00b982]'
                  }`}
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-2 flex flex-col gap-3"
              >
                <a 
                  href="tel:+994123456789" 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 text-gray-700"
                >
                  <Phone className="w-5 h-5 text-[#00b982]" />
                  <span className="font-medium">+994 12 345 67 89</span>
                </a>
                <Button
                  onClick={() => scrollToSection('#appointment')}
                  className="w-full bg-gradient-to-r from-[#00b982] to-[#14b8a6] text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Randevu Al
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
