/**
 * Laboratory Section - DIALAB Klinika (Section 3)
 * Design: Vertical tabs with expanding info cards (matching Diagnostics)
 * Features: 8 main analysis types with subtypes and descriptions
 * Color: Light gradient background with green/blue accents
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
  ArrowRight
} from 'lucide-react';

const laboratoryTypes = [
  {
    id: 'clinical',
    title: 'Kliniki Analizlər',
    icon: Droplets,
    color: '#00b982',
    description: 'Qanın ümumi analizi, hemoglobin, trombositlər və digər əsas göstəricilərin tədqiqi.',
    subtypes: [
      { name: 'Qanın ümumi analizi', desc: '26 göstərici və leykoformula' },
      { name: 'Hemoglobin, Trombositlər, Leykositlər', desc: 'Əsas hüceyrə sayları' },
      { name: 'Sidiyin ümumi analizi', desc: 'Sidik göstəriciləri' },
      { name: 'Nəcisin ümumi analizi', desc: 'Nəcis göstəriciləri' },
      { name: 'Spermogramma', desc: 'Sperma analizi' },
      { name: 'Qan qrupu və rezus-faktor', desc: 'Qan qrupu təyini' }
    ]
  },
  {
    id: 'bacteriological',
    title: 'Bakterioloji Analizlər',
    icon: Microscope,
    color: '#14b8a6',
    description: 'Müxtəlif biomaterialların əkilməsi və infeksiyonların tədqiqi.',
    subtypes: [
      { name: 'Qan əkilməsi', desc: 'Qan steril əkilməsi' },
      { name: 'Sidik əkilməsi', desc: 'Sidik steril əkilməsi' },
      { name: 'Antibiotikoqramma', desc: 'Antibiotiklərə həssaslıq testi' },
      { name: 'Disbakterioz analizi', desc: 'Mikroflorası tarazlığının tədqiqi' }
    ]
  },
  {
    id: 'serological',
    title: 'Seroloji və İmmunoloji',
    icon: TestTube2,
    color: '#0ea5e9',
    description: 'Antiteslər, antigenlərin tədqiqi və immun sistemin vəziyyətinin qiymətləndirilməsi.',
    subtypes: [
      { name: 'RPR, HİV, Hepatit A, B, C', desc: 'Viral infeksiyalar' },
      { name: 'İnfeksiyalar paneli', desc: 'Toksoplazma, Herpes, Xlamidiya' },
      { name: 'Antistreptolizin-ASO, CRP', desc: 'İltihab göstəriciləri' },
      { name: 'İmmunoqlobulinlər', desc: 'IgA, IgM, IgG, IgE' },
      { name: 'T-limfositlər və B-limfositlər', desc: 'İmmun hüceyrələri' }
    ]
  },
  {
    id: 'hormones',
    title: 'Hormonların Tədqiqi',
    icon: Activity,
    color: '#8b5cf6',
    description: 'Endokrin sistemin vəziyyətinin qiymətləndirilməsi üçün hormon testləri.',
    subtypes: [
      { name: 'Qalxanabənzər vəzi hormonları', desc: 'TSH, Free T3, Free T4' },
      { name: 'Reproduktiv hormonlar', desc: 'FSH, LH, Prolaktin, Estradiol' },
      { name: 'Kortizol, DHEA-S, ACTH', desc: 'Adrenal hormonları' },
      { name: 'İnsulin və C-peptid', desc: 'Qlükoza metabolizmi' }
    ]
  },
  {
    id: 'biochemical',
    title: 'Biokimyəvi Analizlər',
    icon: FlaskConical,
    color: '#f59e0b',
    description: 'Qaraciyər, böyrək funksiyası və metabolik göstəricilərin tədqiqi.',
    subtypes: [
      { name: 'Qaraciyər sınaqları', desc: 'ALT, AST, GGT, Bilirubin' },
      { name: 'Böyrək sınaqları', desc: 'Kreatinin, Sidik cövhəri' },
      { name: 'Lipid profili', desc: 'Xolesterin, Triqliseridlər, HDL, LDL' },
      { name: 'Qlükoza, Elektrolitlər', desc: 'Minerallar və qlükoza' }
    ]
  },
  {
    id: 'vitamins',
    title: 'Vitamin və Minerallar',
    icon: Pill,
    color: '#22c55e',
    description: 'Vitamin və mineral defisitlərinin tədqiqi və müalicəsinin planlaşdırılması.',
    subtypes: [
      { name: 'Vitamin D', desc: 'D vitamini səviyyəsi' },
      { name: 'Vitamin B12', desc: 'B12 vitamini səviyyəsi' },
      { name: 'B9 Folat', desc: 'Folat səviyyəsi' },
      { name: 'Kalsium, Maqnezium, Dəmir', desc: 'Mineral elementləri' }
    ]
  },
  {
    id: 'oncological',
    title: 'Onkoloji Testlər',
    icon: Dna,
    color: '#ef4444',
    description: 'Xərçəng markerləri və onkoloji xəstəliklərin erkən diaqnostikası.',
    subtypes: [
      { name: 'Onkomarkerlər', desc: 'PSA, CA-125, CA 15-3, AFP' },
      { name: 'Polimeraz Zəncirvari Reaksiya', desc: 'PZR testləri' },
      { name: 'Histoloji müayinələr', desc: 'Toxuma analizi' },
      { name: 'Biopsiya, Pap-test', desc: 'Hüceyrə analizi' }
    ]
  },
  {
    id: 'genetic',
    title: 'Genetik Müayinələr',
    icon: HeartPulse,
    color: '#ec4899',
    description: 'Genetik xəstəliklərin tədqiqi və genetik konsultasiya.',
    subtypes: [
      { name: 'Tibbi-Genetik Müayinələr', desc: 'Genetik analiz' },
      { name: 'Talassemia testi', desc: 'Talassemia diaqnostikası' },
      { name: 'Xromosom patologiyaları', desc: 'Xromosom analizi' },
      { name: 'Genetik konsultasiya', desc: 'Mütəxəssis məsləhəti' }
    ]
  }
];

export default function LaboratorySection() {
  const [selectedType, setSelectedType] = useState<string>('clinical');

  const selected = laboratoryTypes.find(t => t.id === selectedType);

  return (
    <motion.section 
      id="laboratory" 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="py-24 lg:py-32 bg-gradient-to-b from-white via-[#f0fdf4] to-[#f0f9ff] relative overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00b982]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
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

        {/* Tabs Layout */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Vertical Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1 space-y-3"
          >
            {laboratoryTypes.map((type, index) => (
              <motion.button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  selectedType === type.id
                    ? 'bg-white shadow-lg shadow-black/10 border-2 border-[#00b982]'
                    : 'bg-white/50 hover:bg-white border border-gray-200'
                }`}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{ 
                      backgroundColor: `${type.color}20`,
                      borderLeft: `3px solid ${type.color}`
                    }}
                  >
                    <type.icon className="w-5 h-5" style={{ color: type.color }} />
                  </div>
                  <div className="text-left">
                    <h4 className={`font-bold text-sm transition-colors ${
                      selectedType === type.id ? 'text-[#1a365d]' : 'text-gray-700'
                    }`}>
                      {type.title}
                    </h4>
                  </div>
                </div>

                {/* Hover effect background */}
                {selectedType === type.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#00b982]/5 to-transparent -z-0"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {selected && (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl p-8 shadow-lg shadow-black/5 border border-gray-100 relative overflow-hidden"
                >
                  {/* Background Accent */}
                  <div 
                    className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10 -z-0"
                    style={{ backgroundColor: selected.color }}
                  />

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                        style={{ 
                          backgroundColor: `${selected.color}20`,
                          boxShadow: `0 8px 20px -8px ${selected.color}40`
                        }}
                      >
                        <selected.icon className="w-8 h-8" style={{ color: selected.color }} />
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold text-[#1a365d] mb-2">
                          {selected.title}
                        </h3>
                        <p className="text-gray-600">
                          {selected.description}
                        </p>
                      </div>
                    </div>

                    {/* Subtypes Grid */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-[#1a365d] text-sm uppercase tracking-wide">
                        Altında olan Testlər
                      </h4>
                      <div className="grid gap-3">
                        {selected.subtypes.map((subtype, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-[#f9fafb] to-transparent hover:from-[#f0fdf4] transition-colors group"
                          >
                            <div 
                              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: selected.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm group-hover:text-[#1a365d] transition-colors">
                                {subtype.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {subtype.desc}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                      style={{ 
                        backgroundColor: `${selected.color}20`,
                        color: selected.color,
                        border: `2px solid ${selected.color}40`
                      }}
                    >
                      Ətraflı Məlumat
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
