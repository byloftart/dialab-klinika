import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { buildSettingsMap, getSetting } from '@/lib/siteSettings';
import { getLaboratoryPresentation } from '@/lib/services';

export default function LaboratorySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const { data: settings } = trpc.cms.settings.getGroup.useQuery({ group: 'laboratory' });
  const { data: laboratoryTypes } = trpc.cms.laboratory.list.useQuery();

  useEffect(() => {
    if (!laboratoryTypes?.length) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex >= laboratoryTypes.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, laboratoryTypes]);

  const settingsMap = buildSettingsMap(settings);
  const eyebrow = getSetting(settingsMap, 'laboratory.eyebrow', 'Laboratoriya Xidmətləri');
  const title = getSetting(settingsMap, 'laboratory.title', 'Laboratoriya Xidmətləri');
  const subtitle = getSetting(
    settingsMap,
    'laboratory.subtitle',
    'Geniş spektrli laborator analizlər və dəqiq nəticələr'
  );

  const displayTypes = useMemo(() => {
    return (laboratoryTypes ?? [])
      .filter((item) => item.isActive)
      .map((item, index) => ({
        ...item,
        ...getLaboratoryPresentation(item.icon, index),
      }));
  }, [laboratoryTypes]);

  const visibleType = displayTypes[activeIndex];
  const { data: activeTypeData } = trpc.cms.laboratory.getById.useQuery(
    { id: visibleType?.id ?? 0 },
    { enabled: Boolean(visibleType?.id) }
  );
  const subTests = activeTypeData?.subTests ?? [];

  if (!displayTypes.length) {
    return null;
  }

  return (
    <motion.section
      id="laboratory"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="py-24 lg:py-32 bg-gradient-to-br from-white via-[#f0fdf4] to-[#e8f4fc] relative overflow-hidden border-t-2 border-[#00b982]/30"
    >
      <motion.div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#00b982]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#14b8a6]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00b982]/5 to-[#1a365d]/5 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="mb-16 lg:mb-20 flex justify-center">
          <div className="text-center max-w-3xl">
            <p className="uppercase tracking-[0.2em] text-sm font-semibold text-[#00b982] mb-3">{eyebrow}</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a365d] mb-3">
              {title}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-3">
            {displayTypes.map((analysis, index) => (
              <motion.button
                key={analysis.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setHoveredTab(index)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`w-full text-left p-5 rounded-xl transition-all duration-300 group relative overflow-hidden min-h-[100px] ${
                  activeIndex === index
                    ? 'bg-white border border-[#00b982]/50 shadow-lg shadow-[#00b982]/10'
                    : 'bg-white/50 border border-[#00b982]/10 hover:bg-white hover:border-[#00b982]/30'
                }`}
              >
                {(hoveredTab === index || activeIndex === index) && (
                  <motion.div
                    layoutId="labTabGlow"
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${analysis.color}15 0%, transparent 100%)` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-4">
                  <motion.div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 flex-shrink-0"
                    style={{
                      backgroundColor: `${analysis.color}20`,
                      boxShadow: activeIndex === index ? `0 8px 20px -8px ${analysis.color}60` : 'none'
                    }}
                    animate={{ scale: activeIndex === index ? 1.1 : 1 }}
                  >
                    <analysis.icon className="w-7 h-7" style={{ color: analysis.color }} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg transition-colors ${activeIndex === index ? 'text-[#00b982]' : 'text-[#1a365d] group-hover:text-[#00b982]'}`}>
                      {analysis.titleAz}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {analysis.descriptionAz}
                    </p>
                  </div>
                  <ArrowRight className={`w-5 h-5 transition-all duration-300 ${activeIndex === index ? 'text-[#00b982] translate-x-0' : 'text-gray-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                </div>
              </motion.button>
            ))}
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={visibleType.id}
                initial={{ opacity: 0, rotateY: -10, x: 50 }}
                animate={{ opacity: 1, rotateY: 0, x: 0 }}
                exit={{ opacity: 0, rotateY: 10, x: -50 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative"
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  className="bg-white rounded-3xl border border-[#00b982]/20 overflow-hidden shadow-2xl shadow-[#00b982]/10"
                  whileHover={{ rotateY: 2, rotateX: -2 }}
                  transition={{ duration: 0.4 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <motion.img
                      key={visibleType.imageUrl || visibleType.image}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      src={visibleType.imageUrl || visibleType.image}
                      alt={visibleType.titleAz}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                        style={{ backgroundColor: `${visibleType.color}20`, color: visibleType.color }}
                      >
                        <visibleType.icon className="w-4 h-4" />
                        {eyebrow}
                      </div>
                      <h3 className="text-3xl font-bold text-white mt-3">{visibleType.titleAz}</h3>
                    </div>
                  </div>

                  <div className="p-6 lg:p-8">
                    <p className="text-gray-700 text-lg leading-relaxed font-medium">
                      {visibleType.descriptionAz}
                    </p>

                    <div className="mt-8 grid md:grid-cols-2 gap-4">
                      {subTests.map((test) => (
                        <div key={test.id} className="flex items-start gap-3 bg-[#f7fffb] rounded-2xl border border-[#00b982]/10 p-4">
                          <CheckCircle2 className="w-5 h-5 text-[#00b982] mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-[#1a365d]">{test.titleAz}</h4>
                            {test.descriptionAz && (
                              <p className="text-sm text-gray-600 mt-1">{test.descriptionAz}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {subTests.length === 0 && (
                      <div className="mt-8 rounded-2xl border border-dashed border-[#00b982]/20 p-6 text-center text-gray-500">
                        Bu analiz qrupu üçün alt testlər admin paneldən əlavə oluna bilər.
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
