/**
 * Compact Appointment Form - DIALAB Klinika Hero Section
 * Design: Bright, eye-catching booking form for hero section
 * Features: Quick form with essential fields, vibrant styling
 * Color: Bright gradient background with emerald and teal
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone,
  Send,
  CheckCircle,
  Stethoscope,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { buildServiceOptions } from '@/lib/services';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export default function CompactAppointmentForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    date: '',
    time: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { data: laboratory } = trpc.cms.laboratory.list.useQuery();
  const { data: diagnostics } = trpc.cms.diagnostics.list.useQuery();
  const appointmentMutation = trpc.cms.appointments.create.useMutation();
  const services = buildServiceOptions(laboratory, diagnostics);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.service) {
      toast.error('Zəhmət olmasa bütün məcburi sahələri doldurun');
      return;
    }

    setIsSubmitting(true);
    try {
      await appointmentMutation.mutateAsync({
        fullName: formData.name,
        phone: formData.phone,
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        serviceType: formData.service,
      });

      setIsSubmitted(true);
      toast.success('Randevunuz uğurla qeydə alındı!');

      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          phone: '',
          service: '',
          date: '',
          time: ''
        });
      }, 3000);
    } catch {
      toast.error('Randevu göndərilərkən xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative"
    >
      {/* Bright Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00b982]/20 via-[#14b8a6]/15 to-[#00d4aa]/10 rounded-3xl blur-2xl" />
      
      {/* Form Container */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-[#00b982]/30 overflow-hidden border-2 border-[#00b982]/30 p-6 lg:p-8">
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00b982] to-transparent" />
        
        {/* Form Header */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-3"
          >
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#00b982] to-[#14b8a6] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl lg:text-2xl text-[#1a365d]">Qəbula yazıl</h3>
              <p className="text-gray-600 text-xs">Bir neçə klikdə randevu alın</p>
            </div>
          </motion.div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              <h4 className="font-bold text-2xl text-[#1a365d] mb-2">Təşəkkür Edirik!</h4>
              <p className="text-gray-600">Randevunuz uğurla qeydə alındı. Tezliklə sizinlə əlaqə saxlayacağıq.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              {/* Name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Soyad *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00b982]" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Adınızı daxil edin"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 outline-none transition-all bg-white"
                  />
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00b982]" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+994 XX XXX XX XX"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 outline-none transition-all bg-white"
                  />
                </div>
              </motion.div>

              {/* Service */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">Xidmət Növü *</label>
                <div className="relative">
                  <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00b982]" />
                  <select
                    value={formData.service}
                    onChange={(e) => handleInputChange('service', e.target.value)}
                    className="w-full pl-12 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 outline-none transition-all appearance-none cursor-pointer bg-white"
                  >
                    <option value="">Xidmət seçin</option>
                    {services.map((service) => (
                      <option key={service.value} value={service.value}>{service.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </motion.div>

              {/* Date & Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="grid grid-cols-1 gap-3"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tarix</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00b982]" />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={today}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 outline-none transition-all bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Saat</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00b982]" />
                    <select
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full pl-12 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00b982] focus:ring-4 focus:ring-[#00b982]/10 outline-none transition-all appearance-none cursor-pointer bg-white"
                    >
                      <option value="">Saat seçin</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-[#00b982] via-[#14b8a6] to-[#00d4aa] text-white font-bold rounded-xl shadow-lg shadow-[#00b982]/40 hover:shadow-[#00b982]/60 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Qeydiyyat edilir...
                  </>
                ) : (
                  <>
                    Randevu Al
                    <Send className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Floating Decoration Elements */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#00b982]/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#14b8a6]/10 rounded-full blur-2xl" />
      </div>
    </motion.div>
  );
}
