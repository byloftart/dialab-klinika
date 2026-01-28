/**
 * Footer Section - DIALAB Klinika (Section 6)
 * Design: Contact info, interactive map, social links
 * Features: 3D slide-in effect, gradient background
 * Color: Dark background with green accents
 */

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Facebook,
  Instagram,
  Send
} from 'lucide-react';
import { MapView } from '@/components/Map';

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'start center'],
  });
  
  const slideX = useTransform(scrollYProgress, [0, 1], ['-5%', '0%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  const handleMapReady = (map: google.maps.Map) => {
    // Set marker for DIALAB Klinika location (Baku, Azerbaijan)
    const location = { lat: 40.4093, lng: 49.8671 };
    
    // Use standard Marker
    new google.maps.Marker({
      position: location,
      map: map,
      title: 'DIALAB Klinika',
      icon: {
        url: '/images/dia_logo_symbol.png',
        scaledSize: new google.maps.Size(40, 40),
      }
    });
    
    map.setCenter(location);
    map.setZoom(15);
  };

  return (
    <motion.footer
      id="contact"
      ref={footerRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      style={{ x: slideX }}
      className="relative bg-gradient-to-br from-white via-[#f0fdf4] to-[#e8f4fc] overflow-hidden"
    >
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#00b982]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#14b8a6]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00b982]/5 to-[#1a365d]/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10 py-16">
        {/* Map & Contact Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Interactive Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-80 lg:h-auto rounded-2xl overflow-hidden border border-[#00b982]/20"
          >
            <MapView 
              onMapReady={handleMapReady}
              className="w-full h-full min-h-[320px]"
            />
            
            {/* Map Overlay Card */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00b982] to-[#14b8a6] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1a365d]">DIALAB Klinika</h4>
                  <p className="text-gray-600 text-sm">Bakı şəhəri, Nəsimi rayonu, Nizami küçəsi 123</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-bold text-2xl text-[#1a365d] mb-6">Əlaqə Məlumatları</h3>
              
              <div className="space-y-4">
                <a href="tel:+994123456789" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#00b982]/20 hover:border-[#00b982]/50 hover:shadow-lg hover:shadow-[#00b982]/10 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00b982] to-[#14b8a6] flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Telefon</p>
                    <p className="text-[#1a365d] font-semibold group-hover:text-[#00b982] transition-colors">+994 12 345 67 89</p>
                  </div>
                </a>

                <a href="mailto:info@dialab.az" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#00b982]/20 hover:border-[#00b982]/50 hover:shadow-lg hover:shadow-[#00b982]/10 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#a855f7] flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">E-poçt</p>
                    <p className="text-[#1a365d] font-semibold group-hover:text-[#00b982] transition-colors">info@dialab.az</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#00b982]/20">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#f97316] flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">İş Saatları</p>
                    <p className="text-[#1a365d] font-semibold">B.e - Cümə: 09:00-18:00</p>
                    <p className="text-gray-500 text-sm">Şənbə: 09:00-14:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold text-[#1a365d] mb-4">Sosial Şəbəkələr</h4>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com/dialabklinika"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-6 h-6 text-white" />
                </a>
                <a
                  href="https://instagram.com/dialabklinika"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <Instagram className="w-6 h-6 text-white" />
                </a>
                <a
                  href="https://wa.me/994123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors"
                >
                  <Send className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/images/dia_logo_symbol.png" alt="DIALAB" className="h-10 w-10 object-contain" />
              <div>
                <span className="font-extrabold text-lg text-[#F87171]">DIALAB</span>
                <span className="font-semibold text-sm text-[#00b982] block -mt-1">KLİNİKA</span>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-gray-500 text-sm text-center">
              © {new Date().getFullYear()} DIALAB Klinika. Bütün hüquqlar qorunur.
            </p>

            {/* Links */}
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-[#00b982] transition-colors">Məxfilik Siyasəti</a>
              <a href="#" className="text-gray-400 hover:text-[#00b982] transition-colors">İstifadə Şərtləri</a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
