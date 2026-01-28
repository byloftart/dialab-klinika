/*
 * Laboratory Section - DIALAB Klinika (Section 3)
 * Design: Vertical tabs with expanding 3D info cards (matching Diagnostics)
 * Features: 6 combined analysis types, 3D hover effects, images
 * Color: Light gradient background with green/blue accents
 * Content: From Websiteserviceslist.pdf
 */

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Droplet,
  Microscope,
  Beaker,
  Zap,
  Pill,
  Dna,
  ArrowRight
} from 'lucide-react';

const laboratoryAnalyses = [
  {
    id: 'clinical',
    title: 'Kliniki Analizlər',
    icon: Droplet,
    color: '#00b982',
    image: '/images/lab-analysis.jpg',
    description: 'Qanın ümumi analizi, hemoglobin, trombositlər və digər əsas göstəricilərin tədqiqi.',
    subtypes: [
      { name: 'Qanın ümumi analizi', description: '26 göstərici və leykoformula' },
      { name: 'Hemoglobin, Trombositlər, Leykositlər', description: 'Əsas hüceyrə sayları' },
      { name: 'Sidiyin ümumi analizi', description: 'Sidik göstəriciləri' },
      { name: 'Nəcisin ümumi analizi', description: 'Nəcis göstəriciləri' },
      { name: 'Spermogramma', description: 'Sperma analizi' },
      { name: 'Qan qrupu və rezus-faktor', description: 'Qan qrupu təyini' }
    ]
  },
  {
    id: 'bacterio-hormonal',
    title: 'Bakterioloji və Hormonların Tədqiqi',
    icon: Microscope,
    color: '#ef4444',
    image: '/images/medical-team-abstract.jpg',
    description: 'Bakterial enfeksiyaların müəyyən edilməsi və hormon səviyyələrinin tədqiqi.',
    subtypes: [
      { name: 'Boğaz sürüşməsi', description: 'Streptokkok və digər patogenlərin aşkarlanması' },
      { name: 'Sidik kültürü', description: 'Sidik yolu enfeksiyalarının diaqnostikası' },
      { name: 'Qan kültürü', description: 'Sepsis və qan enfeksiyalarının müəyyən edilməsi' },
      { name: 'Tiroid hormonları (TSH, T3, T4)', description: 'Tiroid funksiyasının qiymətləndirilməsi' },
      { name: 'Seks hormonları', description: 'Estrogen, Progesteron, Testosteron' },
      { name: 'Adrenal hormonları', description: 'Kortizol və digər adrenal hormonları' }
    ]
  },
  {
    id: 'serological',
    title: 'Seroloji və İmmunoloji Testlər',
    icon: Beaker,
    color: '#8b5cf6',
    image: '/images/hero-medical-lab.jpg',
    description: 'Viral və bakteri enfeksiyalarına qarşı antitestlərin aşkarlanması.',
    subtypes: [
      { name: 'HIV testi', description: 'Ən müasir metodlarla HIV aşkarlanması' },
      { name: 'Hepatit testləri (A, B, C)', description: 'Hepatit viruslarına qarşı antitestlər' },
      { name: 'Sifiliz testi (RPR/VDRL)', description: 'Treponema pallidum antitestləri' },
      { name: 'Rubella antitestləri', description: 'Rubella virusuna qarşı IgG və IgM' },
      { name: 'Toxoplasmoz testləri', description: 'Toxoplasma gondii antitestləri' },
      { name: 'CMV antitestləri', description: 'Sitomegalovirusa qarşı antitestlər' }
    ]
  },
  {
    id: 'biochemical',
    title: 'Biokimyəvi Analizlər',
    icon: Zap,
    color: '#f59e0b',
    image: '/images/diagnostics-ultrasound.jpg',
    description: 'Metabolik proseslərin qiymətləndirilməsi və orqan funksiyasının müəyyən edilməsi.',
    subtypes: [
      { name: 'Qlükoza', description: 'Qan şəkərinin səviyyəsi' },
      { name: 'Lipid profili', description: 'Xolesterol, triqliseridlər, HDL, LDL' },
      { name: 'Qaraciyər funksiyası', description: 'ALT, AST, Bilirubin, Albumin' },
      { name: 'Böyrək funksiyası', description: 'Kreatinin, Üreya, Urik asid' },
      { name: 'Elektrolit balansı', description: 'Natrium, Kalium, Kalsium, Fosfat' },
      { name: 'Amilaza və Lipaza', description: 'Pankreas enzimləri' }
    ]
  },
  {
    id: 'vitamins-minerals',
    title: 'Vitamin və Minerallar',
    icon: Pill,
    color: '#14b8a6',
    image: '/images/doctor-consultation.jpg',
    description: 'Vital vitamin və mineral səviyyələrinin tədqiqi və defisit müəyyən edilməsi.',
    subtypes: [
      { name: 'Vitamin D', description: '25-OH Vitamin D səviyyəsi' },
      { name: 'Vitamin B12 və Folat', description: 'B12 və folik asid səviyyələri' },
      { name: 'Demir (Ferritin, Serum Iron)', description: 'Demir ehtiyatlarının qiymətləndirilməsi' },
      { name: 'Kalsium və Fosfat', description: 'Sümük metabolizmi göstəriciləri' },
      { name: 'Maqnezium', description: 'Serum maqnezium səviyyəsi' },
      { name: 'Sink və Mis', description: 'Trace elementlərin tədqiqi' }
    ]
  },
  {
    id: 'oncology-genetics',
    title: 'Onkoloji və Genetik Testlər',
    icon: Dna,
    color: '#ec4899',
    image: '/images/lab-analysis.jpg',
    description: 'Tumor markerləri və genetik mutasyonların aşkarlanması.',
    subtypes: [
      { name: 'PSA (Prostat Spesifik Antigen)', description: 'Prostat xərçəngi markerı' },
      { name: 'CEA (Karsinoembrionik Antigen)', description: 'Kolorektal xərçəngi markerı' },
      { name: 'CA 19-9', description: 'Pankreas xərçəngi markerı' },
      { name: 'BRCA1/BRCA2 mutasyonları', description: 'Meme xərçəngi genetik riski' },
      { name: 'Herediter xərçəngi sendromları', description: 'Lynch sendromu və digərləri' },
      { name: 'Mikrosatellit instabilliyi', description: 'Genetik xərçəngi predispozisiyası' }
    ]
  }
];

export default function LaboratorySection() {
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  });
  
  const slideY = useTransform(scrollYProgress, [0, 1], ['20%', '0%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  const activeAnalysis = laboratoryAnalyses[activeTab];

  return (
    <motion.section
      id="laboratory"
      ref={sectionRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      style={{ y: slideY }}
      className="py-24 lg:py-32 bg-gradient-to-br from-white via-[#f0fdf4] to-[#e8f4fc] relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#00b982]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#14b8a6]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00b982]/5 to-[#1a365d]/5 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header - Hidden */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 lg:mb-20 flex justify-center"
        >
          <motion.div 
            className="inline-block px-8 py-4 rounded-2xl border-2 border-[#00b982]/30 bg-gradient-to-r from-[#00b982]/5 to-[#14b8a6]/5 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1a365d] to-[#00b982] uppercase tracking-wider">
              Laboratoriya
            </h2>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 hidden"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-[#00b982]/20 text-[#00b982] font-semibold text-sm mb-4 border border-[#00b982]/30"
          >
            Laboratoriya Xidmətləri
          </motion.span>
          <h2 className="font-extrabold text-4xl md:text-5xl lg:text-6xl text-[#1a365d] mb-4">
            Müasir <span className="text-[#00b982]">Laboratoriya</span> Testləri
          </h2>
          <p className="text-gray-700 text-xl font-medium max-w-2xl mx-auto">
            500+ növ laboratoriya testi ilə səğlamlığınızı dəqiq və etibarlı şəkildə qiymətləndiririk
          </p>
        </motion.div>

        {/* Main Content - Vertical Tabs Layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Vertical Tabs */}
          <div className="lg:col-span-4 space-y-3">
            {laboratoryAnalyses.map((analysis, index) => (
              <motion.button
                key={analysis.id}
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
                    layoutId="labTabGlow"
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${analysis.color}15 0%, transparent 100%)` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className="relative z-10 flex items-center gap-4">
                  <motion.div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300"
                    style={{ 
                      backgroundColor: `${analysis.color}20`,
                      boxShadow: activeTab === index ? `0 8px 20px -8px ${analysis.color}60` : 'none'
                    }}
                    animate={{ scale: activeTab === index ? 1.1 : 1 }}
                  >
                    <analysis.icon className="w-6 h-6" style={{ color: analysis.color }} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-base transition-colors ${activeTab === index ? 'text-[#00b982]' : 'text-[#1a365d] group-hover:text-[#00b982]'}`}>
                      {analysis.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-1">
                      {analysis.subtypes.length} test növü
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
                      key={activeAnalysis.image}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      src={activeAnalysis.image}
                      alt={activeAnalysis.title}
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
                      <span className="text-white font-semibold text-sm">{activeAnalysis.subtypes.length} Test</span>
                    </motion.div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div 
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-xl mb-3"
                        style={{ backgroundColor: activeAnalysis.color }}
                      >
                        <activeAnalysis.icon className="w-5 h-5 text-white" />
                        <span className="text-white font-semibold">{activeAnalysis.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Description */}
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {activeAnalysis.description}
                    </p>

                    {/* Subtypes Grid */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      {activeAnalysis.subtypes.map((subtype, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: activeAnalysis.color }}
                            />
                            <span className="text-gray-800 text-sm font-semibold group-hover:text-[#00b982] transition-colors">{subtype.name}</span>
                          </div>
                          <p className="text-gray-500 text-xs ml-4">{subtype.description}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300"
                      style={{ 
                        backgroundColor: `${activeAnalysis.color}20`,
                        color: activeAnalysis.color,
                        border: `2px solid ${activeAnalysis.color}40`
                      }}
                      whileHover={{ 
                        backgroundColor: activeAnalysis.color,
                        color: 'white',
                        scale: 1.02
                      }}
                    >
                      Ətraflı Məlumat
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Volumetric Section Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#00b982]/5 to-[#f0fdf4] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00b982]/30 to-transparent" />
    </motion.section>
  );
}
