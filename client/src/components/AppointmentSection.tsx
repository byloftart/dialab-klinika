/**
 * Appointment Section - DIALAB Klinika (Section 5)
 * Design: Booking form with FAQ accordion
 * Features: Form validation, service selection, FAQ, contact info
 * Color: Light green/white background
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MessageSquare,
  Send,
  CheckCircle,
  Stethoscope,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

const services = [
  { value: 'laboratory', label: 'Laboratoriya Testləri' },
  { value: 'usm', label: 'Ultrasəs Müayinəsi (USM)' },
  { value: 'cardio', label: 'Kardioloji Diaqnostika' },
  { value: 'neuro', label: 'Nevroloji Müayinə' },
  { value: 'gyneco', label: 'Ginekoloji Müayinə' },
  { value: 'ent', label: 'LOR Müayinəsi' },
  { value: 'general', label: 'Ümumi Həkim Məsləhəti' },
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

const faqItems = [
  {
    question: 'Randevu almaq üçün nə etməliyəm?',
    answer: 'Randevu almaq üçün bu formu doldurun, telefonla (+994 12 345 67 89) zəng edin və ya WhatsApp vasitəsilə əlaqə saxlayın. Operatorlarımız sizə ən uyğun vaxtı təyin edəcəklər.',
  },
  {
    question: 'Laboratoriya testlərinin nəticələri nə qədər vaxt alır?',
    answer: 'Əksər standart testlərin nəticələri 24-48 saat ərzində hazır olur. Bəzi xüsusi testlər (genetik, onkoloji) 5-7 iş günü tələb edə bilər.',
  },
  {
    question: 'Hansı ödəniş üsullarını qəbul edirsiniz?',
    answer: 'Nağd, bank kartları (Visa, MasterCard) və bank köçürməsi ilə ödəniş qəbul edirik. Bəzi sığorta şirkətləri ilə də əməkdaşlıq edirik.',
  },
  {
    question: 'Müayinəyə gəlmədən əvvəl nə etməliyəm?',
    answer: 'Qan testləri üçün 8-12 saat ac qalmaq tövsiyə olunur. USM müayinəsi üçün xüsusi hazırlıq tələb oluna bilər - qeydiyyat zamanı məlumat veriləcək.',
  },
  {
    question: 'Nəticələri necə ala bilərəm?',
    answer: 'Nəticələri klinikadan şəxsən, e-poçt vasitəsilə və ya onlayn portalımızdan əldə edə bilərsiniz. Həmçinin WhatsApp vasitəsilə də göndərə bilərik.',
  },
];

export default function AppointmentSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    date: '',
    time: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.service) {
      toast.error('Zəhmət olmasa bütün məcburi sahələri doldurun');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Randevunuz uğurla qeydə alındı!');
    
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        service: '',
        date: '',
        time: '',
        message: ''
      });
    }, 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.section 
      id="appointment" 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="py-24 lg:py-32 bg-gradient-to-b from-[#f0fdf4] to-white relative overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00b982]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#14b8a6]/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-[#00b982]/10 text-[#00b982] text-sm font-medium mb-4">
            Onlayn Randevu
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1a365d] mb-6">
            Randevu <span className="text-[#00b982]">Alın</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Formu dolduraraq və ya birbaşa əlaqə saxlayaraq randevu ala bilərsiniz
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-3xl shadow-xl shadow-black/5 overflow-hidden border border-gray-100">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-[#00b982] to-[#14b8a6] p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">Randevu Formu</h3>
                    <p className="text-white/80 text-sm">Məlumatlarınızı daxil edin</p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <h3 className="font-bold text-2xl text-[#1a365d] mb-2">Təşəkkür Edirik!</h3>
                    <p className="text-gray-600">Randevunuz uğurla qeydə alındı. Tezliklə sizinlə əlaqə saxlayacağıq.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="p-6 space-y-5"
                  >
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Adınızı daxil edin"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefon *</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+994 XX XXX XX XX"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">E-poçt</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="email@example.com"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Service */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Xidmət Növü *</label>
                      <div className="relative">
                        <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={formData.service}
                          onChange={(e) => handleInputChange('service', e.target.value)}
                          className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Xidmət seçin</option>
                          {services.map((service) => (
                            <option key={service.value} value={service.value}>{service.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tarix</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            min={today}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Saat</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            value={formData.time}
                            onChange={(e) => handleInputChange('time', e.target.value)}
                            className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 outline-none transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Saat seçin</option>
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Əlavə Qeyd</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          rows={3}
                          placeholder="Əlavə məlumat və ya suallarınız..."
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-[#00b982] to-[#14b8a6] text-white font-semibold rounded-xl shadow-lg shadow-[#00b982]/25 hover:shadow-[#00b982]/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Göndərilir...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Randevu Sorğusu Göndər
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#00b982]/10 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-[#00b982]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1a365d]">Tez-tez Verilən Suallar</h3>
                <p className="text-sm text-gray-500">Ən çox soruşulan suallar</p>
              </div>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-white rounded-2xl shadow-lg shadow-black/5 overflow-hidden border border-gray-100"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-[#1a365d] pr-4">{item.question}</span>
                    <motion.div
                      animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-0">
                          <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Working Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 p-6 bg-gradient-to-r from-[#00b982]/10 to-[#14b8a6]/10 rounded-2xl border border-[#00b982]/20"
            >
              <h4 className="font-bold text-[#1a365d] mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00b982]" />
                İş Saatları
              </h4>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Bazar ertəsi - Cümə</span>
                  <span className="font-semibold text-[#00b982]">09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Şənbə</span>
                  <span className="font-semibold text-[#00b982]">09:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Bazar</span>
                  <span className="font-semibold text-gray-400">Bağlı</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
