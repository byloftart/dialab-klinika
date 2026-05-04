import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { buildSettingsMap, getSetting } from '@/lib/siteSettings';
import { getLaboratoryPresentation } from '@/lib/services';
import { laboratoryCatalog } from '@shared/serviceCatalog';

type FallbackLaboratoryType = {
  id: number;
  titleAz: string;
  descriptionAz: string;
  imageUrl: string | null;
  icon: string | null;
  order: number | null;
  isActive: boolean;
  subTests: Array<[string, string]>;
};

type RenderLaboratoryType = {
  id: number;
  titleAz: string;
  descriptionAz: string;
  imageUrl?: string | null;
  image?: string;
  icon: React.ElementType;
  color: string;
  order?: number | null;
  isActive?: boolean;
  subTests?: Array<[string, string]>;
};

export default function LaboratorySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const { data: settings } = trpc.cms.settings.getGroup.useQuery({ group: 'laboratory' });
  const { data: laboratoryTypes } = trpc.cms.laboratory.list.useQuery();
  const cmsLaboratoryTypes = (laboratoryTypes ?? []).filter((item) => item.isActive);
  const isUsingFallbackCatalog = cmsLaboratoryTypes.length === 0;

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
  const rawTitle = getSetting(settingsMap, 'laboratory.title', 'LABORATORİYA');
  const title = rawTitle.toUpperCase() === 'LABORATORIYA XIDMƏTLƏRI' ? 'LABORATORİYA' : rawTitle.toUpperCase();

  const displayTypes = useMemo<RenderLaboratoryType[]>(() => {
    const sourceItems: Array<
      | (typeof cmsLaboratoryTypes)[number]
      | FallbackLaboratoryType
    > = isUsingFallbackCatalog
      ? laboratoryCatalog.map((item, index) => ({
          id: -(index + 1),
          titleAz: item.titleAz,
          descriptionAz: item.descriptionAz,
          imageUrl: null,
          icon: item.icon,
          order: item.order,
          isActive: true,
          subTests: item.subTests,
        }))
      : cmsLaboratoryTypes;

    return sourceItems
      .map((item, index) => ({
        ...item,
        ...getLaboratoryPresentation(item.icon, index),
      }));
  }, [cmsLaboratoryTypes, isUsingFallbackCatalog]);

  const visibleType = displayTypes[activeIndex];
  const { data: activeTypeData } = trpc.cms.laboratory.getById.useQuery(
    { id: visibleType?.id ?? 0 },
    { enabled: Boolean(visibleType?.id) && !isUsingFallbackCatalog && (visibleType?.id ?? 0) > 0 }
  );
  const subTests = isUsingFallbackCatalog
    ? ((visibleType?.subTests ?? []) as Array<[string, string]>).map(([titleAz, descriptionAz], index) => ({
        id: index,
        titleAz,
        descriptionAz,
      }))
    : (activeTypeData?.subTests ?? []);

  const openAppointment = () => {
    document.querySelector('#appointment')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
      className="py-24 lg:py-32 bg-gradient-to-br from-[#eef5f7] via-[#e5f1ef] to-[#dbe8f2] relative overflow-hidden border-t-2 border-[#00b982]/30"
    >
      <motion.div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#00b982]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#14b8a6]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00b982]/5 to-[#1a365d]/5 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="mb-16 lg:mb-20 flex justify-center">
          <div className="text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-[0.04em] text-[#1a365d]">
              {title}
            </h2>
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
                className={`w-full text-left px-5 py-6 rounded-2xl transition-all duration-300 group relative overflow-hidden min-h-[96px] ${
                  activeIndex === index
                    ? 'bg-white border border-[#00b982]/55 shadow-[0_18px_36px_-24px_rgba(0,185,130,0.32)]'
                    : 'bg-white/72 border border-[#cddbd7] shadow-[0_12px_28px_-26px_rgba(15,31,53,0.18)] hover:bg-white hover:border-[#00b982]/28 hover:shadow-[0_18px_34px_-26px_rgba(15,31,53,0.22)]'
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
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-[1.42rem] leading-[1.05] line-clamp-2 transition-colors ${activeIndex === index ? 'text-[#00b982]' : 'text-[#1a365d] group-hover:text-[#00b982]'}`}>
                      {analysis.titleAz}
                    </h3>
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
                  className="overflow-hidden rounded-3xl border border-[#cddbd7] bg-white shadow-[0_24px_54px_-30px_rgba(15,31,53,0.24)]"
                  whileHover={{ rotateY: 2, rotateX: -2 }}
                  transition={{ duration: 0.4 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="relative h-72 overflow-hidden">
                    <motion.img
                      key={visibleType.imageUrl || visibleType.image}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      src={visibleType.imageUrl || visibleType.image}
                      alt={visibleType.titleAz}
                      className="w-full h-full object-cover scale-[1.04] blur-[1.5px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0f1f35]/60 via-[#142b4a]/35 to-black/35" />
                    <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                      <div className="max-w-3xl">
                        <h3 className="text-4xl font-bold leading-tight text-white md:text-5xl">
                          {visibleType.titleAz}
                        </h3>
                        <p className="mt-4 text-base font-medium leading-relaxed text-white/90 md:text-lg">
                          {visibleType.descriptionAz}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 lg:p-8">
                    <div className="grid md:grid-cols-2 gap-5">
                      {subTests.map((test) => (
                        <div key={test.id} className="flex min-h-[84px] items-center gap-3 rounded-2xl border border-[#d4e2de] bg-[#f8fcfb] px-5 py-5 shadow-[0_14px_30px_-26px_rgba(15,31,53,0.2)]">
                          <CheckCircle2 className="w-5 h-5 text-[#00b982] mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-lg font-semibold leading-snug text-[#1a365d]">{test.titleAz}</h4>
                            {test.descriptionAz && (
                              <p className="mt-1 text-sm text-gray-600">{test.descriptionAz}</p>
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

                    <div className="mt-8 flex justify-end">
                      <button
                        type="button"
                        onClick={openAppointment}
                        className="inline-flex items-center gap-2 rounded-full bg-[#00b982] px-5 py-3 text-white font-semibold shadow-lg shadow-[#00b982]/20 hover:bg-[#00a572] transition-colors"
                      >
                        Randevu Al
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
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
