/**
 * InfoBar - Three 3D cards below the hero slider
 * Design: Light, airy cards with hover effects matching the rest of the site.
 * Columns: Contacts | Appointment | Opening Hours
 */

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InfoBar() {
  const [formData, setFormData] = useState({ name: '', phone: '', service: '', date: '', time: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
    setFormData({ name: '', phone: '', service: '', date: '', time: '' });
  };

  const cardBase =
    'group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 p-8 lg:p-10 ' +
    'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-8px_rgba(0,185,130,0.15)] ' +
    'transition-all duration-500 hover:-translate-y-1';

  const iconBox =
    'w-12 h-12 rounded-xl bg-gradient-to-br from-[#00b982]/10 to-[#14b8a6]/10 ' +
    'flex items-center justify-center group-hover:from-[#00b982]/20 group-hover:to-[#14b8a6]/20 transition-all duration-500';

  return (
    <section className="relative z-30 -mt-16 pb-8 border-b-2 border-[#00b982]/30">
      <div className="container mx-auto px-6 lg:px-12 xl:px-16">
        <div className="grid md:grid-cols-3 gap-6">

          {/* ─── Card 1: Contacts ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
            className={cardBase}
          >
            {/* Glow on hover */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#00b982]/0 to-[#14b8a6]/0 group-hover:from-[#00b982]/5 group-hover:to-[#14b8a6]/5 transition-all duration-500 -z-10" />

            <div className="flex items-center gap-4 mb-6">
              <div className={iconBox}>
                <Phone className="w-5 h-5 text-[#00b982]" />
              </div>
              <div>
                <p className="text-xs text-[#00b982] font-semibold uppercase tracking-widest">Bizimlə</p>
                <h3 className="text-lg font-bold text-gray-900">Əlaqə</h3>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-[#00b982]/60 flex-shrink-0" />
                <span>Bakı, Nəsimi rayonu,<br />Atatürk prospekti 45</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#00b982]/60 flex-shrink-0" />
                <div>
                  <a href="tel:+994123456789" className="hover:text-[#00b982] transition-colors">+994 12 345 67 89</a>
                  <br />
                  <a href="tel:+994501234567" className="hover:text-[#00b982] transition-colors">+994 50 123 45 67</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#00b982]/60 flex-shrink-0" />
                <a href="mailto:info@dialab.az" className="hover:text-[#00b982] transition-colors">info@dialab.az</a>
              </div>
            </div>
          </motion.div>

          {/* ─── Card 2: Appointment ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cardBase}
          >
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#00b982]/0 to-[#14b8a6]/0 group-hover:from-[#00b982]/5 group-hover:to-[#14b8a6]/5 transition-all duration-500 -z-10" />

            <div className="flex items-center gap-4 mb-6">
              <div className={iconBox}>
                <Calendar className="w-5 h-5 text-[#00b982]" />
              </div>
              <div>
                <p className="text-xs text-[#00b982] font-semibold uppercase tracking-widest">Qəbula</p>
                <h3 className="text-lg font-bold text-gray-900">Yazıl</h3>
              </div>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#00b982]/10 flex items-center justify-center mx-auto mb-3">
                  <Send className="w-5 h-5 text-[#00b982]" />
                </div>
                <p className="text-gray-900 font-semibold">Qəbul edildi!</p>
                <p className="text-gray-500 text-xs mt-1">Tezliklə əlaqə saxlanılacaq</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-[#00b982] focus:ring-1 focus:ring-[#00b982]/20 outline-none transition-all"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Telefon"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-[#00b982] focus:ring-1 focus:ring-[#00b982]/20 outline-none transition-all"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 focus:border-[#00b982] focus:ring-1 focus:ring-[#00b982]/20 outline-none transition-all"
                  />
                  <select
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 focus:border-[#00b982] focus:ring-1 focus:ring-[#00b982]/20 outline-none transition-all"
                  >
                    <option value="">Saat</option>
                    {['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#00b982] to-[#14b8a6] text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#00b982]/20 transition-all duration-300 disabled:opacity-60"
                >
                  {isSubmitting ? 'Göndərilir...' : (
                    <>Qəbula Yazıl <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* ─── Card 3: Opening Hours ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cardBase}
          >
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#00b982]/0 to-[#14b8a6]/0 group-hover:from-[#00b982]/5 group-hover:to-[#14b8a6]/5 transition-all duration-500 -z-10" />

            <div className="flex items-center gap-4 mb-6">
              <div className={iconBox}>
                <Clock className="w-5 h-5 text-[#00b982]" />
              </div>
              <div>
                <p className="text-xs text-[#00b982] font-semibold uppercase tracking-widest">İş</p>
                <h3 className="text-lg font-bold text-gray-900">Saatları</h3>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { day: 'Bazar ertəsi – Cümə', hours: '08:00 – 18:00', active: true },
                { day: 'Şənbə', hours: '09:00 – 15:00', active: true },
                { day: 'Bazar', hours: 'Bağlı', active: false },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between pb-3 ${i < 2 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-sm text-gray-600">{row.day}</span>
                  <span className={`text-sm font-semibold ${row.active ? 'text-gray-900' : 'text-gray-400'}`}>
                    {row.hours}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-[#00b982] animate-pulse" />
              Təcili hallarda <strong className="text-gray-700">7/24</strong> xidmət
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
