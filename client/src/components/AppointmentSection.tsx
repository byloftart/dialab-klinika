import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { buildSettingsMap, getSetting, parseJsonSetting } from '@/lib/siteSettings';
import FeedbackForm from './FeedbackForm';

type FaqItem = {
  question: string;
  answer: string;
};

const fallbackFaqItems: FaqItem[] = [
  {
    question: 'Randevu almaq üçün nə etməliyəm?',
    answer: 'Randevu almaq üçün formu doldurun, telefonla zəng edin və ya WhatsApp vasitəsilə əlaqə saxlayın. Operatorlarımız sizə uyğun vaxt təklif edəcəklər.',
  },
  {
    question: 'Laboratoriya testlərinin nəticələri nə qədər vaxt alır?',
    answer: 'Standart testlərin çoxu 24-48 saat ərzində hazır olur. Xüsusi testlər daha uzun müddət tələb edə bilər.',
  },
  {
    question: 'Hansı ödəniş üsullarını qəbul edirsiniz?',
    answer: 'Nağd, bank kartları və bank köçürməsi ilə ödəniş mümkündür. Bəzi sığorta şirkətləri ilə əməkdaşlıq da mümkündür.',
  },
  {
    question: 'Nəticələri necə ala bilərəm?',
    answer: 'Nəticələri klinikadan, e-poçt vasitəsilə və ya onlayn formada təqdim edə bilərik.',
  },
];

export default function AppointmentSection() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const { data: appointmentSettings } = trpc.cms.settings.getGroup.useQuery({ group: 'appointment' });

  const settingsMap = buildSettingsMap(appointmentSettings);
  const sectionTitle = getSetting(settingsMap, 'appointment.title', 'Məlumat');
  const faqTitle = getSetting(settingsMap, 'appointment.faqTitle', 'Tez-tez Verilən Suallar');
  const faqSubtitle = getSetting(settingsMap, 'appointment.faqSubtitle', 'Ən çox soruşulan suallar');
  const faqItems = parseJsonSetting<FaqItem[]>(settingsMap['appointment.faqItems'], fallbackFaqItems)
    .filter((item) => item?.question && item?.answer);

  return (
    <motion.section
      id="appointment"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="py-24 lg:py-32 bg-gradient-to-b from-[#f0fdf4] to-white relative overflow-hidden border-t-2 border-[#00b982]/30"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00b982]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#14b8a6]/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="mb-16 lg:mb-20 flex justify-center">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a365d] mb-3">
              {sectionTitle}
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <FeedbackForm />
          </motion.div>

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
                <h3 className="text-2xl font-bold text-[#1a365d]">{faqTitle}</h3>
                <p className="text-base text-gray-600">{faqSubtitle}</p>
              </div>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={`${item.question}-${index}`}
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
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
