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
import FeedbackForm from './FeedbackForm';

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
        {/* Section Header - Hidden */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 lg:mb-16"
        >
          <motion.h2 
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#1a365d] mb-4 uppercase tracking-tight"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a365d] to-[#00b982] hover:from-[#00b982] hover:to-[#14b8a6] transition-all duration-300">
              MĖLUMĂT
            </span>
          </motion.h2>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 hidden"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-[#00b982]/10 text-[#00b982] text-sm font-medium mb-4">
            Onlayn Randevu
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1a365d] mb-6">
            Randevu <span className="text-[#00b982]">Alın</span>
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto text-xl font-medium">
            Formu doldurarak və ya birbaaaş əlaqə saxlayarak randevu ala bilərsiniz
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Feedback Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <FeedbackForm />
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
                <h3 className="text-2xl font-bold text-[#1a365d]">Tez-tez Verilən Suallar</h3>
                <p className="text-base text-gray-600">En çox soruşulan suallar</p>
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
                    <span className="font-semibold text-[#1a365d] pr-4 text-base">{item.question}</span>
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
                          <p className="text-gray-700 text-base leading-relaxed font-medium">{item.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Working Hours removed - moved to footer */}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
