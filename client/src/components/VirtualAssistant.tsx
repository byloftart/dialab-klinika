/**
 * Virtual Assistant - DIALAB Klinika
 * Design: Floating button with expandable chat-like interface
 * Features: Persistent across site, WhatsApp/call options, smooth animations
 * Color: Green/teal accent colors
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Phone, 
  Calendar,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

const quickActions = [
  {
    id: 'whatsapp',
    icon: MessageCircle,
    label: 'WhatsApp ilə Yazın',
    description: 'Sürətli cavab alın',
    color: 'from-green-500 to-green-600',
    href: 'https://wa.me/994123456789?text=Salam,%20DIALAB%20Klinikadan%20məlumat%20almaq%20istəyirəm.',
  },
  {
    id: 'call',
    icon: Phone,
    label: 'Zəng Edin',
    description: '+994 12 345 67 89',
    color: 'from-[#00b982] to-[#14b8a6]',
    href: 'tel:+994123456789',
  },
  {
    id: 'appointment',
    icon: Calendar,
    label: 'Randevu Alın',
    description: 'Onlayn qeydiyyat',
    color: 'from-[#8b5cf6] to-[#a855f7]',
    action: 'scroll-to-appointment',
  },
  {
    id: 'faq',
    icon: HelpCircle,
    label: 'Tez-tez Verilən Suallar',
    description: 'Cavabları tapın',
    color: 'from-[#f59e0b] to-[#f97316]',
    action: 'scroll-to-faq',
  },
];

export default function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: typeof quickActions[0]) => {
    if (action.href) {
      window.open(action.href, '_blank');
    } else if (action.action === 'scroll-to-appointment') {
      const element = document.getElementById('appointment');
      if (element) {
        const headerHeight = 80;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - headerHeight, behavior: 'smooth' });
      }
      setIsOpen(false);
    } else if (action.action === 'scroll-to-faq') {
      const element = document.getElementById('appointment');
      if (element) {
        const headerHeight = 80;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - headerHeight, behavior: 'smooth' });
      }
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00b982] to-[#14b8a6] p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <img src="/images/dia_logo_symbol.png" alt="DIALAB" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-white">DIALAB Klinika</h3>
                  <p className="text-white/80 text-sm">Sizə necə kömək edə bilərik?</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 space-y-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAction(action)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 group-hover:text-[#00b982] transition-colors">{action.label}</p>
                    <p className="text-gray-500 text-sm">{action.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#00b982] group-hover:translate-x-1 transition-all" />
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
              <p className="text-center text-gray-400 text-xs">
                İş saatları: B.e - Cümə 09:00-18:00
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-16 h-16 rounded-full bg-gradient-to-r from-[#00b982] to-[#14b8a6] shadow-lg shadow-[#00b982]/40 flex items-center justify-center group"
      >
        {/* Pulse Animation */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[#00b982]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Badge */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
          >
            <span className="text-white text-xs font-bold">1</span>
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}
