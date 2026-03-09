/**
 * Feedback Form Component - DIALAB Klinika
 * Design: Contact and feedback form for patient inquiries
 * Features: Form validation, message submission, success feedback
 * Color: Light green/white background with gradient accents
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone,
  MessageSquare,
  Send,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { buildSettingsMap, getSetting } from '@/lib/siteSettings';

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { data: feedbackSettings } = trpc.cms.settings.getGroup.useQuery({ group: 'feedback' });
  const feedbackMutation = trpc.cms.feedback.create.useMutation();

  const settingsMap = buildSettingsMap(feedbackSettings);
  const title = getSetting(settingsMap, 'feedback.title', 'Bizə Yazın');
  const subtitle = getSetting(settingsMap, 'feedback.subtitle', 'Suallarınız və təklifləriniz üçün');
  const subjectPlaceholder = getSetting(settingsMap, 'feedback.subjectPlaceholder', 'Mesajın mövzusu');
  const buttonLabel = getSetting(settingsMap, 'feedback.buttonLabel', 'Göndər');
  const successTitle = getSetting(settingsMap, 'feedback.successTitle', 'Təşəkkür Edirik!');
  const successText = getSetting(
    settingsMap,
    'feedback.successText',
    'Mesajınız uğurla göndərildi. Tezliklə sizinlə əlaqə saxlayacağıq.'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Zəhmət olmasa bütün məcburi sahələri doldurun');
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackMutation.mutateAsync({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      setIsSubmitted(true);
      toast.success('Mesajınız uğurla göndərildi!');

      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }, 3000);
    } catch {
      toast.error('Mesaj göndərilərkən xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div className="bg-white rounded-3xl shadow-xl shadow-black/5 overflow-hidden border border-gray-100">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-[#00b982] to-[#14b8a6] p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">{title}</h3>
              <p className="text-white/80 text-sm">{subtitle}</p>
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
              <h3 className="font-bold text-2xl text-[#1a365d] mb-2">{successTitle}</h3>
              <p className="text-gray-600">{successText}</p>
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
                <label className="block text-base font-semibold text-gray-800 mb-2">Ad Soyad *</label>
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

              {/* Email & Phone */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">E-mail *</label>
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
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Telefon</label>
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
              </div>

              {/* Subject */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Mövzu</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder={subjectPlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Mesaj *</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={4}
                    placeholder="Mesajınızı yazın..."
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
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Göndərilir...
                  </>
                ) : (
                  <>
                    {buttonLabel}
                    <Send className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
