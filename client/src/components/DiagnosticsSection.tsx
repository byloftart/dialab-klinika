import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { buildSettingsMap, getSetting } from '@/lib/siteSettings';
import { getDiagnosticPresentation } from '@/lib/services';

export default function DiagnosticsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const { data: settings } = trpc.cms.settings.getGroup.useQuery({ group: 'diagnostics' });
  const { data: diagnostics } = trpc.cms.diagnostics.list.useQuery();

  const displayServices = useMemo(() => {
    return (diagnostics ?? [])
      .filter((item) => item.isActive)
      .map((item, index) => ({
        ...item,
        ...getDiagnosticPresentation(item.icon, index),
      }));
  }, [diagnostics]);

  const visibleService = displayServices[activeIndex];
  const { data: activeServiceData } = trpc.cms.diagnostics.getById.useQuery(
    { id: visibleService?.id ?? 0 },
    { enabled: Boolean(visibleService?.id) }
  );

  useEffect(() => {
    if (!displayServices.length) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex >= displayServices.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, displayServices.length]);

  const settingsMap = buildSettingsMap(settings);
  const eyebrow = getSetting(settingsMap, 'diagnostics.eyebrow', 'Tibbi Diaqnostika');
  const title = getSetting(settingsMap, 'diagnostics.title', 'Tibbi Diaqnostika');
  const subtitle = getSetting(
    settingsMap,
    'diagnostics.subtitle',
    'Müasir avadanlıqlarla instrumental diaqnostika'
  );

  if (!displayServices.length) {
    return null;
  }

  return (
    <motion.section
      id="diagnostics"
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
            {displayServices.map((service, index) => (
              <motion.button
                key={service.id}
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
                    layoutId="diagnosticTabGlow"
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${service.color}15 0%, transparent 100%)` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-4">
                  <motion.div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 flex-shrink-0"
                    style={{
                      backgroundColor: `${service.color}20`,
                      boxShadow: activeIndex === index ? `0 8px 20px -8px ${service.color}60` : 'none'
                    }}
                    animate={{ scale: activeIndex === index ? 1.1 : 1 }}
                  >
                    <service.icon className="w-7 h-7" style={{ color: service.color }} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg transition-colors ${activeIndex === index ? 'text-[#00b982]' : 'text-[#1a365d] group-hover:text-[#00b982]'}`}>
                      {service.titleAz}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {service.descriptionAz}
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
                key={visibleService.id}
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
                      key={visibleService.imageUrl || visibleService.image}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      src={visibleService.imageUrl || visibleService.image}
                      alt={visibleService.titleAz}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                        style={{ backgroundColor: `${visibleService.color}20`, color: visibleService.color }}
                      >
                        <visibleService.icon className="w-4 h-4" />
                        {eyebrow}
                      </div>
                      <h3 className="text-3xl font-bold text-white mt-3">{visibleService.titleAz}</h3>
                    </div>
                  </div>

                  <div className="p-6 lg:p-8">
                    <p className="text-gray-700 text-lg leading-relaxed font-medium">
                      {visibleService.descriptionAz}
                    </p>

                    <div className="mt-8 grid md:grid-cols-2 gap-4">
                      {(activeServiceData?.subServices ?? []).map((subService) => (
                        <div key={subService.id} className="flex items-start gap-3 bg-[#f7fffb] rounded-2xl border border-[#00b982]/10 p-4">
                          <CheckCircle2 className="w-5 h-5 text-[#00b982] mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-[#1a365d]">{subService.titleAz}</h4>
                            {subService.descriptionAz && (
                              <p className="text-sm text-gray-600 mt-1">{subService.descriptionAz}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {(activeServiceData?.subServices ?? []).length === 0 && (
                      <div className="mt-8 rounded-2xl border border-dashed border-[#00b982]/20 p-6 text-center text-gray-500">
                        Bu xidmət üçün alt diaqnostika punktları admin paneldən əlavə oluna bilər.
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
