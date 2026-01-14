/**
 * Header Component - DIALAB Klinika
 * Design: Swiss Design + 3D Depth
 * Features: Sticky navigation, logo hover effect, soft teal/blue glow on nav items
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { id: 'home', label: 'Ana Səhifə', href: '#home' },
  { id: 'laboratory', label: 'Laboratoriya', href: '#laboratory' },
  { id: 'diagnostics', label: 'Diaqnostika', href: '#diagnostics' },
  { id: 'appointment', label: 'Randevu Al', href: '#appointment' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

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
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-teal-500/5'
          : 'bg-transparent'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#home');
            }}
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="relative">
              <motion.img
                src="/images/dia_logo_symbol.png"
                alt="DIALAB Logo"
                className="h-12 w-12 object-contain"
                whileHover={{ 
                  filter: 'drop-shadow(0 0 12px rgba(20, 184, 166, 0.6))',
                }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl text-[#F87171] leading-tight tracking-tight">
                DIALAB
              </span>
              <span className="font-heading font-semibold text-sm text-teal-600 -mt-0.5">
                KLİNİKA
              </span>
            </div>
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className={`relative px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeSection === item.id
                    ? 'text-teal-700'
                    : 'text-slate-600 hover:text-teal-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Glow background on hover */}
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10"
                  initial={{ opacity: 0 }}
                  whileHover={{ 
                    opacity: 1,
                    boxShadow: '0 0 20px rgba(20, 184, 166, 0.2), inset 0 0 20px rgba(20, 184, 166, 0.05)'
                  }}
                  transition={{ duration: 0.3 }}
                />
                {/* Active indicator */}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-teal-50 border border-teal-200/50"
                    style={{ boxShadow: '0 0 15px rgba(20, 184, 166, 0.15)' }}
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
              className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium text-sm">+994 12 345 67 89</span>
            </a>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => scrollToSection('#appointment')}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300"
              >
                Randevu Al
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-teal-600 hover:bg-teal-50 transition-colors"
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
            className="lg:hidden bg-white/95 backdrop-blur-md border-t border-teal-100"
          >
            <nav className="container py-4 flex flex-col gap-2">
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
                  transition={{ delay: index * 0.1 }}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    activeSection === item.id
                      ? 'bg-teal-50 text-teal-700 shadow-sm'
                      : 'text-slate-600 hover:bg-teal-50 hover:text-teal-600'
                  }`}
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-2"
              >
                <Button
                  onClick={() => scrollToSection('#appointment')}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl"
                >
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
