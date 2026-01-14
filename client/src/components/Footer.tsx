/**
 * Footer Section - DIALAB Klinika
 * Design: 3D block sliding in effect, FAQ accordion, interactive map
 * Features: Gradient background, clean typography, social links
 */

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Facebook,
  Instagram,
  Send
} from 'lucide-react';
import { MapView } from '@/components/Map';

const faqItems = [
  {
    question: 'Laboratoriya testləri üçün ac qalmaq lazımdır?',
    answer: 'Bəli, əksər qan testləri üçün 8-12 saat ac qalmaq tövsiyə olunur. Lakin bəzi testlər üçün ac qalmaq tələb olunmur. Randevu zamanı mütəxəssislərimiz sizə dəqiq məlumat verəcək.'
  },
  {
    question: 'Test nəticələri nə qədər müddətə hazır olur?',
    answer: 'Standart laboratoriya testlərinin nəticələri 24-48 saat ərzində hazır olur. Bəzi xüsusi testlər üçün 3-5 iş günü tələb oluna bilər. Təcili nəticə xidmətimiz də mövcuddur.'
  },
  {
    question: 'Onlayn randevu necə ala bilərəm?',
    answer: 'Saytımızdakı "Randevu Al" bölməsindən formu dolduraraq və ya WhatsApp vasitəsilə bizimlə əlaqə saxlayaraq randevu ala bilərsiniz. Həmçinin +994 12 345 67 89 nömrəsinə zəng edə bilərsiniz.'
  },
  {
    question: 'Hansı sığorta şirkətləri ilə işləyirsiniz?',
    answer: 'Biz Azərbaycandakı əksər sığorta şirkətləri ilə əməkdaşlıq edirik. Sığorta ilə bağlı dəqiq məlumat üçün bizimlə əlaqə saxlayın.'
  },
  {
    question: 'Evdə qan analizi xidmətiniz varmı?',
    answer: 'Bəli, evdə qan nümunəsi götürmə xidmətimiz mövcuddur. Bu xidmət əlavə ödənişlidir və əvvəlcədən randevu tələb olunur.'
  }
];

export default function Footer() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'start center'],
  });
  
  const slideX = useTransform(scrollYProgress, [0, 1], ['-10%', '0%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  const handleMapReady = (map: google.maps.Map) => {
    // Set marker for DIALAB Klinika location (Baku, Azerbaijan)
    const location = { lat: 40.4093, lng: 49.8671 };
    
    // Use AdvancedMarkerElement from the marker library
    const markerContent = document.createElement('div');
    markerContent.innerHTML = `
      <div style="background: linear-gradient(135deg, #14b8a6, #06b6d4); padding: 8px; border-radius: 50%; box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);">
        <img src="/images/dia_logo_symbol.png" alt="DIALAB" style="width: 32px; height: 32px; object-fit: contain;" />
      </div>
    `;
    
    new google.maps.marker.AdvancedMarkerElement({
      position: location,
      map: map,
      title: 'DIALAB Klinika',
      content: markerContent,
    });
    
    map.setCenter(location);
    map.setZoom(15);
  };

  return (
    <motion.footer
      id="faq"
      ref={footerRef}
      style={{ x: slideX, opacity }}
      className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="container relative z-10 py-16">
        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 rounded-full bg-teal-500/20 text-teal-400 font-semibold text-sm mb-4 border border-teal-500/30"
            >
              Tez-tez Verilən Suallar
            </motion.span>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-white">
              Suallarınız <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Cavablanır</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left group"
                >
                  <span className="font-medium text-white group-hover:text-teal-400 transition-colors pr-4">
                    {item.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center"
                  >
                    <ChevronDown className="w-5 h-5 text-teal-400" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-5 text-slate-400 leading-relaxed border-t border-white/10 pt-4">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Map & Contact Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Interactive Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-80 lg:h-auto rounded-2xl overflow-hidden border border-white/10"
          >
            <MapView 
              onMapReady={handleMapReady}
              className="w-full h-full min-h-[320px]"
            />
            
            {/* Map Overlay Card */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-900">DIALAB Klinika</h4>
                  <p className="text-slate-600 text-sm">Bakı şəhəri, Nəsimi rayonu, Nizami küçəsi 123</p>
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
              <h3 className="font-heading font-bold text-2xl text-white mb-6">Əlaqə Məlumatları</h3>
              
              <div className="space-y-4">
                <a href="tel:+994123456789" className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Telefon</p>
                    <p className="text-white font-semibold group-hover:text-teal-400 transition-colors">+994 12 345 67 89</p>
                  </div>
                </a>

                <a href="mailto:info@dialab.az" className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">E-poçt</p>
                    <p className="text-white font-semibold group-hover:text-teal-400 transition-colors">info@dialab.az</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">İş Saatları</p>
                    <p className="text-white font-semibold">B.e - Cümə: 09:00-18:00</p>
                    <p className="text-slate-400 text-sm">Şənbə: 09:00-14:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-heading font-semibold text-white mb-4">Sosial Şəbəkələr</h4>
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
                <span className="font-heading font-extrabold text-lg text-[#F87171]">DIALAB</span>
                <span className="font-heading font-semibold text-sm text-teal-400 block -mt-1">KLİNİKA</span>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-slate-500 text-sm text-center">
              © {new Date().getFullYear()} DIALAB Klinika. Bütün hüquqlar qorunur.
            </p>

            {/* Links */}
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">Məxfilik Siyasəti</a>
              <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">İstifadə Şərtləri</a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
