/**
 * Diagnostics Section - DIALAB Klinika
 * Design: Vertical slide-in transition, accordion with 6 vertical tabs
 * Features: 3D info cards with doctor photos, smooth animations
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
    color: 'from-teal-500 to-cyan-500',
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
    color: 'from-rose-500 to-red-500',
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
    color: 'from-violet-500 to-purple-500',
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
    color: 'from-pink-500 to-rose-500',
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
    color: 'from-amber-500 to-orange-500',
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
    color: 'from-emerald-500 to-teal-500',
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
      className="py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      </div>

      <div className="container relative z-10">
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
            className="inline-block px-4 py-2 rounded-full bg-teal-500/20 text-teal-400 font-semibold text-sm mb-4 border border-teal-500/30"
          >
            Diaqnostika Xidmətləri
          </motion.span>
          <h2 className="font-heading font-extrabold text-4xl md:text-5xl text-white mb-4">
            Tibbi <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Diaqnostika</span> və Müalicə
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Müasir avadanlıqlar və təcrübəli mütəxəssislərlə dəqiq diaqnostika
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
                    ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {/* Glow effect on hover */}
                {(hoveredTab === index || activeTab === index) && (
                  <motion.div
                    layoutId="tabGlow"
                    className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg transition-transform duration-300 ${activeTab === index ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-heading font-bold text-base transition-colors ${activeTab === index ? 'text-teal-400' : 'text-white group-hover:text-teal-300'}`}>
                      {service.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-1">
                      {service.services.length} xidmət
                    </p>
                  </div>
                  <ArrowRight className={`w-5 h-5 transition-all duration-300 ${activeTab === index ? 'text-teal-400 translate-x-0' : 'text-slate-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
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
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
                  whileHover={{ 
                    rotateY: 2,
                    rotateX: -2,
                    translateZ: 20,
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
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    
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
                      <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r ${activeService.color} mb-3`}>
                        <activeService.icon className="w-5 h-5 text-white" />
                        <span className="text-white font-semibold">{activeService.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Description */}
                    <p className="text-slate-300 text-lg leading-relaxed">
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
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeService.color}`} />
                          <span className="text-slate-300 text-sm">{service}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Doctor Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-white">{activeService.doctor.name}</h4>
                        <p className="text-teal-400 text-sm">{activeService.doctor.specialty}</p>
                        <p className="text-slate-500 text-sm">{activeService.doctor.experience}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const element = document.getElementById('appointment');
                          if (element) element.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="ml-auto px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all"
                      >
                        Randevu Al
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>

                {/* 3D Shadow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-3xl blur-2xl -z-10 opacity-50" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
