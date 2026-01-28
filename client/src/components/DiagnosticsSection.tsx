/**
 * Diagnostics Section - DIALAB Klinika (Section 4)
 * Design: Vertical tabs with expanding 3D info cards
 * Features: Doctor photos, service descriptions, hover animations
 * Color: Dark background with green/blue accents
 * Content: From Websiteserviceslist.pdf
 */

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, 
  Heart, 
  Brain, 
  Baby,
  Ear,
  Activity,
  User,
  ArrowRight
} from 'lucide-react';

const diagnosticsServices = [
  {
    id: 'usm',
    title: 'Ultrasəs Müayinəsi (USM)',
    icon: Activity,
    color: '#00b982',
    image: '/images/diagnostics-ultrasound.jpg',
    description: 'Ən müasir USM cihazları ilə daxili orqanların, kiçik çanaq üzvlərinin və hamiləliyin müayinəsi.',
    services: [
      'Daxili orqanların USM-i',
      'Kiçik çanaq üzvlərinin USM-i',
      'Hamiləliyin USM-i və Doppleroqrafiya',
      'Damarların Doppleroqrafiyası',
      'Digər USM müayinələri'
    ],
    doctor: {
      name: 'Dr. Aynur Məmmədova',
      specialty: 'USM Mütəxəssisi',
      experience: '12 il təcrübə'
    }
  },
  {
    id: 'cardio',
    title: 'Kardioloji Diaqnostika',
    icon: Heart,
    color: '#ef4444',
    image: '/images/doctor-consultation.jpg',
    description: 'Ürək-damar sisteminin hərtərəfli müayinəsi və diaqnostikası.',
    services: [
      'Elektrokardioqramma (EKQ)',
      'Holter EKQ monitorinqi',
      'Exokardioqrafiya (EXO-KQ)',
      'Stress testi',
      'Kardioloji konsultasiya'
    ],
    doctor: {
      name: 'Dr. Rəşad Hüseynov',
      specialty: 'Kardioloq',
      experience: '18 il təcrübə'
    }
  },
  {
    id: 'neuro',
    title: 'Nevroloji Müayinə',
    icon: Brain,
    color: '#8b5cf6',
    image: '/images/lab-analysis.jpg',
    description: 'Sinir sisteminin müayinəsi və nevroloji xəstəliklərin diaqnostikası.',
    services: [
      'Elektroensefaloqramma (EEQ)',
      'Nevroloji müayinə',
      'Baş ağrılarının diaqnostikası',
      'Yuxu pozğunluqları müayinəsi',
      'Nevropatoloq konsultasiyası'
    ],
    doctor: {
      name: 'Dr. Leyla Əliyeva',
      specialty: 'Nevropatoloq',
      experience: '15 il təcrübə'
    }
  },
  {
    id: 'gyneco',
    title: 'Ginekoloji Müayinə',
    icon: Baby,
    color: '#ec4899',
    image: '/images/diagnostics-ultrasound.jpg',
    description: 'Qadın sağlamlığı üçün hərtərəfli ginekoloji müayinə və diaqnostika.',
    services: [
      'Kolposkopiya',
      'Ginekoloji USM',
      'Hamiləlik müayinəsi',
      'Hormonal müayinə',
      'Ginekoloq konsultasiyası'
    ],
    doctor: {
      name: 'Dr. Səbinə Quliyeva',
      specialty: 'Ginekoloq',
      experience: '20 il təcrübə'
    }
  },
  {
    id: 'ent',
    title: 'LOR Müayinəsi',
    icon: Ear,
    color: '#f59e0b',
    image: '/images/doctor-consultation.jpg',
    description: 'Qulaq, burun və boğaz xəstəliklərinin müayinəsi və müalicəsi.',
    services: [
      'Endoskopik müayinə',
      'Audiometriya',
      'Rinoskopiya',
      'Laringoskopiya',
      'LOR konsultasiyası'
    ],
    doctor: {
      name: 'Dr. Kamran Əhmədov',
      specialty: 'Otolorinqoloq-Foniatr',
      experience: '14 il təcrübə'
    }
  },
  {
    id: 'general',
    title: 'Ümumi Həkim Məsləhəti',
    icon: Stethoscope,
    color: '#14b8a6',
    image: '/images/doctor-consultation.jpg',
    description: 'Təcrübəli mütəxəssislərdən fərdi yanaşma və peşəkar məsləhət.',
    services: [
      'Terapevt konsultasiyası',
      'Pediatr konsultasiyası',
      'Endokrinoloq konsultasiyası',
      'Dermatoveneroloq konsultasiyası',
      'Reabilitoloq və Fizioterapiya'
    ],
    doctor: {
      name: 'Dr. Nigar Həsənova',
      specialty: 'Terapevt',
      experience: '16 il təcrübə'
    }
  }
];

export default function DiagnosticsSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  });
  
  const slideY = useTransform(scrollYProgress, [0, 1], ['20%', '0%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  const activeService = diagnosticsServices[activeTab];

  return (
    <motion.section
      id="diagnostics"
      ref={sectionRef}
      style={{ y: slideY, opacity }}
      className="py-24 lg:py-32 bg-[#0f1012] relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#00b982]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#14b8a6]/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
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
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-[#00b982]/20 text-[#00b982] font-semibold text-sm mb-4 border border-[#00b982]/30"
          >
            Diaqnostika Xidmətləri
          </motion.span>          <h2 className="font-extrabold text-3xl md:text-4xl lg:text-5xl text-[#1a365d] mb-4">
            Tibbi <span className="text-[#00b982]">Diaqnostika</span> və Müalicə
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Müasir avadanlıqlar və təcrübəli mütəxəssisrlərlə dəqiq diaqnostika
          </p>
        </motion.div>

        {/* Main Content - Vertical Tabs Layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Vertical Tabs */}
          <div className="lg:col-span-4 space-y-3">
            {diagnosticsServices.map((service, index) => (
              <motion.button
                key={service.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setActiveTab(index)}
                onMouseEnter={() => setHoveredTab(index)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  activeTab === index
                    ? 'bg-white border border-[#00b982]/50 shadow-lg shadow-[#00b982]/10'
                    : 'bg-white/50 border border-[#00b982]/10 hover:bg-white hover:border-[#00b982]/30'
                }`}
              >
                {/* Glow effect on hover */}
                {(hoveredTab === index || activeTab === index) && (
                  <motion.div
                    layoutId="tabGlow"
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${service.color}15 0%, transparent 100%)` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className="relative z-10 flex items-center gap-4">
                  <motion.div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300"
                    style={{ 
                      backgroundColor: `${service.color}20`,
                      boxShadow: activeTab === index ? `0 8px 20px -8px ${service.color}60` : 'none'
                    }}
                    animate={{ scale: activeTab === index ? 1.1 : 1 }}
                  >
                    <service.icon className="w-6 h-6" style={{ color: service.color }} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-base transition-colors ${activeTab === index ? 'text-[#00b982]' : 'text-[#1a365d] group-hover:text-[#00b982]'}`}>
                      {service.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-1">
                      {service.services.length} xidmət
                    </p>
                  </div>
                  <ArrowRight className={`w-5 h-5 transition-all duration-300 ${activeTab === index ? 'text-[#00b982] translate-x-0' : 'text-gray-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                </div>
              </motion.button>
            ))}
          </div>

          {/* 3D Info Card */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, rotateY: -10, x: 50 }}
                animate={{ opacity: 1, rotateY: 0, x: 0 }}
                exit={{ opacity: 0, rotateY: 10, x: -50 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative"
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  className="bg-white rounded-3xl border border-[#00b982]/20 overflow-hidden shadow-2xl shadow-[#00b982]/10"
                  whileHover={{ 
                    rotateY: 2,
                    rotateX: -2,
                  }}
                  transition={{ duration: 0.4 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Image Header */}
                  <div className="relative h-64 overflow-hidden">
                    <motion.img
                      key={activeService.image}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      src={activeService.image}
                      alt={activeService.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-transparent" />
                    
                    {/* Floating Badge */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute top-4 right-4 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30"
                    >
                      <span className="text-white font-semibold text-sm">{activeService.services.length} Xidmət</span>
                    </motion.div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div 
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-xl mb-3"
                        style={{ backgroundColor: activeService.color }}
                      >
                        <activeService.icon className="w-5 h-5 text-white" />
                        <span className="text-white font-semibold">{activeService.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Description */}
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {activeService.description}
                    </p>

                    {/* Services Grid */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      {activeService.services.map((service, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: activeService.color }}
                          />
                          <span className="text-gray-300 text-sm">{service}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Doctor Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-white/10"
                      style={{ background: `linear-gradient(135deg, ${activeService.color}15 0%, transparent 100%)` }}
                    >
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                        style={{ 
                          backgroundColor: activeService.color,
                          boxShadow: `0 8px 20px -8px ${activeService.color}60`
                        }}
                      >
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-center sm:text-left">
                        <h4 className="font-bold text-white">{activeService.doctor.name}</h4>
                        <p className="text-sm" style={{ color: activeService.color }}>{activeService.doctor.specialty}</p>
                        <p className="text-gray-500 text-sm">{activeService.doctor.experience}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const element = document.getElementById('appointment');
                          if (element) {
                            const headerHeight = 80;
                            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                            window.scrollTo({ top: elementPosition - headerHeight, behavior: 'smooth' });
                          }
                        }}
                        className="sm:ml-auto px-6 py-3 text-white font-semibold rounded-xl shadow-lg transition-all"
                        style={{ 
                          background: `linear-gradient(135deg, ${activeService.color}, ${activeService.color}cc)`,
                          boxShadow: `0 10px 30px -10px ${activeService.color}60`
                        }}
                      >
                        Randevu Al
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>

                {/* 3D Shadow Effect */}
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl -z-10 opacity-30"
                  style={{ background: `linear-gradient(135deg, ${activeService.color}40 0%, transparent 100%)` }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
