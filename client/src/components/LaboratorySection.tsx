/**
 * Laboratory Section - DIALAB Klinika (Section 3)
 * Design: Accordion-style container with animated 3D tiles
 * Features: Medical icons, hover glow effects, 3D motion
 * Color: White background with soft green/blue accents
 * Content: From Websiteserviceslist.pdf
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplets, 
  Microscope, 
  TestTube2, 
  Activity, 
  Dna, 
  FlaskConical,
  Pill,
  HeartPulse,
  ChevronDown
} from 'lucide-react';

const laboratoryCategories = [
  {
    id: 'clinical',
    title: 'Kliniki Analizlər',
    icon: Droplets,
    color: '#00b982',
    services: [
      'Qanın ümumi analizi (26 göstərici və leykoformula)',
      'Hemoglobin, Trombositlər, Leykositlər',
      'Sidiyin ümumi analizi',
      'Nəcisin ümumi analizi',
      'Spermogramma',
      'Qan qrupu və rezus-faktor'
    ]
  },
  {
    id: 'bacteriological',
    title: 'Bakterioloji Analizlər',
    icon: Microscope,
    color: '#14b8a6',
    services: [
      'Müxtəlif biomaterialların əkilməsi',
      'Qan, sidik, sperma, yaxma əkilməsi',
      'Antibiotikoqramma',
      'Disbakterioz analizi'
    ]
  },
  {
    id: 'serological',
    title: 'Seroloji və İmmunoloji Testlər',
    icon: TestTube2,
    color: '#0ea5e9',
    services: [
      'RPR (Sifilis testi), HİV, Hepatit A, B, C',
      'İnfeksiyalar paneli (Toksoplazma, Herpes, Xlamidiya)',
      'Antistreptolizin-ASO, CRP, Revmatoid faktor',
      'İmmunoqlobulinlər (IgA, IgM, IgG, IgE)',
      'T-limfositlər və B-limfositlər'
    ]
  },
  {
    id: 'hormones',
    title: 'Hormonların Tədqiqi',
    icon: Activity,
    color: '#8b5cf6',
    services: [
      'Qalxanabənzər vəzi hormonları (TSH, Free T3, Free T4)',
      'Reproduktiv hormonlar (FSH, LH, Prolaktin, Estradiol)',
      'Kortizol, DHEA-S, ACTH',
      'İnsulin və C-peptid'
    ]
  },
  {
    id: 'biochemical',
    title: 'Biokimyəvi Analizlər',
    icon: FlaskConical,
    color: '#f59e0b',
    services: [
      'Qaraciyər sınaqları (ALT, AST, GGT, Bilirubin)',
      'Böyrək sınaqları (Kreatinin, Sidik cövhəri)',
      'Lipid profili (Xolesterin, Triqliseridlər, HDL, LDL)',
      'Qlükoza, Elektrolitlər, Minerallar'
    ]
  },
  {
    id: 'vitamins',
    title: 'Vitamin və Mineral Testləri',
    icon: Pill,
    color: '#22c55e',
    services: [
      'Vitamin D',
      'Vitamin B12',
      'B9 Folat',
      'Kalsium, Maqnezium, Dəmir'
    ]
  },
  {
    id: 'oncological',
    title: 'Onkoloji Testlər',
    icon: Dna,
    color: '#ef4444',
    services: [
      'Onkomarkerlər (PSA, CA-125, CA 15-3, AFP)',
      'Polimeraz Zəncirvari Reaksiya (PZR)',
      'Histoloji və Sitoloji Müayinələr',
      'Biopsiya, Pap-test'
    ]
  },
  {
    id: 'genetic',
    title: 'Genetik Müayinələr',
    icon: HeartPulse,
    color: '#ec4899',
    services: [
      'Tibbi-Genetik Müayinələr',
      'Talassemia testi',
      'Xromosom patologiyaları',
      'Genetik konsultasiya'
    ]
  }
];

export default function LaboratorySection() {
  const [expandedAccordion, setExpandedAccordion] = useState<number>(0);
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);

  const firstGroup = laboratoryCategories.slice(0, 4);
  const secondGroup = laboratoryCategories.slice(4, 8);

  return (
    <section id="laboratory" className="py-24 lg:py-32 bg-gradient-to-b from-white to-[#f0fdf4] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00b982]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#14b8a6]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
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
            className="inline-block px-4 py-2 rounded-full bg-[#00b982]/10 text-[#00b982] font-semibold text-sm mb-4"
          >
            Laboratoriya Xidmətləri
          </motion.span>
          <h2 className="font-extrabold text-3xl md:text-4xl lg:text-5xl text-[#1a365d] mb-4">
            Müasir <span className="text-[#00b982]">Laboratoriya</span> Testləri
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            500+ növ laboratoriya testi ilə sağlamlığınızı dəqiq və etibarlı şəkildə qiymətləndiririk
          </p>
        </motion.div>

        {/* Accordion Container */}
        <div className="space-y-6 max-w-6xl mx-auto">
          {[firstGroup, secondGroup].map((group, groupIndex) => (
            <motion.div
              key={groupIndex}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: groupIndex * 0.2 }}
            >
              {/* Accordion Header */}
              <button
                onClick={() => setExpandedAccordion(expandedAccordion === groupIndex ? -1 : groupIndex)}
                className="w-full flex items-center justify-between p-6 bg-white rounded-2xl shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300 group border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ 
                      background: groupIndex === 0 
                        ? 'linear-gradient(135deg, #00b982, #14b8a6)' 
                        : 'linear-gradient(135deg, #f59e0b, #ef4444)'
                    }}
                  >
                    <span className="text-white font-bold text-lg">{groupIndex + 1}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-xl text-[#1a365d]">
                      {groupIndex === 0 ? 'Əsas Laboratoriya Testləri' : 'Xüsusi Testlər və Müayinələr'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {groupIndex === 0 ? 'Kliniki, Bakterioloji, Seroloji, Hormonal' : 'Biokimyəvi, Vitamin, Onkoloji, Genetik'}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedAccordion === groupIndex ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-2 rounded-full bg-gray-100 group-hover:bg-[#00b982]/10 transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-[#00b982]" />
                </motion.div>
              </button>

              {/* Accordion Content - 3D Tiles Grid */}
              <AnimatePresence>
                {expandedAccordion === groupIndex && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                      {group.map((category, index) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 20, rotateX: -10 }}
                          animate={{ opacity: 1, y: 0, rotateX: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          onMouseEnter={() => setHoveredTile(category.id)}
                          onMouseLeave={() => setHoveredTile(null)}
                          className="group relative"
                          style={{ perspective: '1000px' }}
                        >
                          <motion.div
                            className="relative bg-white rounded-2xl p-6 border border-gray-100 transition-all duration-500"
                            animate={{
                              rotateY: hoveredTile === category.id ? 5 : 0,
                              rotateX: hoveredTile === category.id ? -5 : 0,
                              translateY: hoveredTile === category.id ? -8 : 0,
                            }}
                            style={{
                              transformStyle: 'preserve-3d',
                              boxShadow: hoveredTile === category.id 
                                ? `0 25px 50px -12px ${category.color}40, 0 0 30px ${category.color}20`
                                : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            }}
                          >
                            {/* Icon */}
                            <motion.div
                              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                              style={{ 
                                backgroundColor: `${category.color}15`,
                                boxShadow: `0 8px 20px -8px ${category.color}40`
                              }}
                              animate={{
                                rotate: hoveredTile === category.id ? 360 : 0,
                                scale: hoveredTile === category.id ? 1.1 : 1,
                              }}
                              transition={{ duration: 0.6 }}
                            >
                              <category.icon className="w-7 h-7" style={{ color: category.color }} />
                            </motion.div>

                            {/* Title */}
                            <h4 className="font-bold text-lg text-[#1a365d] mb-3 group-hover:text-[#00b982] transition-colors">
                              {category.title}
                            </h4>

                            {/* Services List */}
                            <ul className="space-y-2">
                              {category.services.slice(0, 4).map((service, sIndex) => (
                                <motion.li
                                  key={sIndex}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + sIndex * 0.05 }}
                                  className="flex items-start gap-2 text-sm text-gray-600"
                                >
                                  <span 
                                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  <span className="line-clamp-2">{service}</span>
                                </motion.li>
                              ))}
                            </ul>

                            {/* Hover Glow Effect */}
                            <div 
                              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                              style={{
                                background: `radial-gradient(circle at 50% 50%, ${category.color}15 0%, transparent 70%)`,
                              }}
                            />
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">Bütün laboratoriya testləri haqqında məlumat almaq üçün</p>
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
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00b982] to-[#14b8a6] text-white font-semibold rounded-xl shadow-lg shadow-[#00b982]/25 hover:shadow-[#00b982]/40 transition-all duration-300"
          >
            Əlaqə Saxlayın
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
