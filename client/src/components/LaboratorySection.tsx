/**
 * Laboratory Section - DIALAB Klinika
 * Design: Accordion-style container with 8 animated 3D tiles
 * Features: Medical icons, hover glow effects, 3D motion
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
    color: 'from-teal-500 to-cyan-500',
    shadowColor: 'shadow-teal-500/30',
    glowColor: 'rgba(20, 184, 166, 0.4)',
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
    color: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/30',
    glowColor: 'rgba(16, 185, 129, 0.4)',
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
    color: 'from-cyan-500 to-blue-500',
    shadowColor: 'shadow-cyan-500/30',
    glowColor: 'rgba(6, 182, 212, 0.4)',
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
    color: 'from-violet-500 to-purple-500',
    shadowColor: 'shadow-violet-500/30',
    glowColor: 'rgba(139, 92, 246, 0.4)',
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
    color: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/30',
    glowColor: 'rgba(245, 158, 11, 0.4)',
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
    color: 'from-lime-500 to-green-500',
    shadowColor: 'shadow-lime-500/30',
    glowColor: 'rgba(132, 204, 22, 0.4)',
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
    color: 'from-rose-500 to-red-500',
    shadowColor: 'shadow-rose-500/30',
    glowColor: 'rgba(244, 63, 94, 0.4)',
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
    color: 'from-pink-500 to-rose-500',
    shadowColor: 'shadow-pink-500/30',
    glowColor: 'rgba(236, 72, 153, 0.4)',
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
    <section id="laboratory" className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
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
            className="inline-block px-4 py-2 rounded-full bg-teal-100 text-teal-700 font-semibold text-sm mb-4"
          >
            Laboratoriya Xidmətləri
          </motion.span>
          <h2 className="font-heading font-extrabold text-4xl md:text-5xl text-slate-900 mb-4">
            Müasir <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">Laboratoriya</span> Testləri
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            500+ növ laboratoriya testi ilə sağlamlığınızı dəqiq və etibarlı şəkildə qiymətləndiririk
          </p>
        </motion.div>

        {/* Accordion Container */}
        <div className="space-y-6">
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
                className="w-full flex items-center justify-between p-6 bg-white rounded-2xl shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${groupIndex === 0 ? 'from-teal-500 to-cyan-500' : 'from-amber-500 to-rose-500'} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">{groupIndex + 1}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-heading font-bold text-xl text-slate-900">
                      {groupIndex === 0 ? 'Əsas Laboratoriya Testləri' : 'Xüsusi Testlər və Müayinələr'}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {groupIndex === 0 ? 'Kliniki, Bakterioloji, Seroloji, Hormonal' : 'Biokimyəvi, Vitamin, Onkoloji, Genetik'}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedAccordion === groupIndex ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-2 rounded-full bg-slate-100 group-hover:bg-teal-100 transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-slate-600 group-hover:text-teal-600" />
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
                            className={`relative bg-white rounded-2xl p-6 border border-slate-100 transition-all duration-500 ${category.shadowColor}`}
                            animate={{
                              rotateY: hoveredTile === category.id ? 5 : 0,
                              rotateX: hoveredTile === category.id ? -5 : 0,
                              translateY: hoveredTile === category.id ? -8 : 0,
                              translateZ: hoveredTile === category.id ? 20 : 0,
                            }}
                            style={{
                              transformStyle: 'preserve-3d',
                              boxShadow: hoveredTile === category.id 
                                ? `0 25px 50px -12px ${category.glowColor}, 0 0 30px ${category.glowColor}`
                                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                          >
                            {/* Icon */}
                            <motion.div
                              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg ${category.shadowColor}`}
                              animate={{
                                rotate: hoveredTile === category.id ? 360 : 0,
                                scale: hoveredTile === category.id ? 1.1 : 1,
                              }}
                              transition={{ duration: 0.6 }}
                            >
                              <category.icon className="w-7 h-7 text-white" />
                            </motion.div>

                            {/* Title */}
                            <h4 className="font-heading font-bold text-lg text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">
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
                                  className="flex items-start gap-2 text-sm text-slate-600"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${category.color} mt-2 flex-shrink-0`} />
                                  <span className="line-clamp-2">{service}</span>
                                </motion.li>
                              ))}
                            </ul>

                            {/* Hover Glow Effect */}
                            <div 
                              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                              style={{
                                background: `radial-gradient(circle at 50% 50%, ${category.glowColor} 0%, transparent 70%)`,
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
          <p className="text-slate-600 mb-4">Bütün laboratoriya testləri haqqında məlumat almaq üçün</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const element = document.getElementById('appointment');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-300"
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
