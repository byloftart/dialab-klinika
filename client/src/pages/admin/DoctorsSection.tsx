import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Instagram, MessageCircle, Plus, Send } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { buildSettingsMap, getSetting } from '@/lib/siteSettings';
import { doctorsCatalog } from '@shared/doctorsCatalog';

type FallbackDoctor = {
  id: number;
  nameAz: string;
  specialtyAz: string;
  bioAz: string | null;
  photoUrl: string | null;
  whatsappUrl?: string | null;
  telegramUrl?: string | null;
  instagramUrl?: string | null;
  experienceYears: number | null;
  order: number | null;
  isActive: boolean;
};

type ContactLink = {
  href: string;
  label: string;
  icon: typeof MessageCircle;
};

const doctorBackdropImages = [
  '/images/doctor-consultation.jpg',
  '/images/medical-team-abstract.jpg',
  '/images/hero-medical-lab.jpg',
];

function getDoctorDisplayName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');
}

function getDoctorBackdrop(index: number, photoUrl: string | null | undefined) {
  return photoUrl || doctorBackdropImages[index % doctorBackdropImages.length];
}

function getDoctorImageClass(hasCustomPhoto: boolean) {
  if (hasCustomPhoto) {
    return 'h-full w-full bg-white object-contain object-top p-4 transition-transform duration-700 ease-out origin-top group-hover:scale-[1.03]';
  }

  return 'h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]';
}

function toWhatsappHref(rawValue: string) {
  const normalized = rawValue.replace(/[^\d+]/g, '');
  const phone = normalized.startsWith('+') ? normalized.slice(1) : normalized;
  return phone ? `https://wa.me/${phone}` : '#appointment';
}

export default function DoctorsSection() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [metrics, setMetrics] = useState({ visibleCount: 4, gap: 24, cardWidth: 0 });

  const { data: doctorSettings } = trpc.cms.settings.getGroup.useQuery({ group: 'doctors' });
  const { data: socialSettings } = trpc.cms.settings.getGroup.useQuery({ group: 'social' });
  const { data: contactSettings } = trpc.cms.settings.getGroup.useQuery({ group: 'contact' });
  const { data: doctors } = trpc.cms.doctors.list.useQuery();

  const cmsDoctors = (doctors ?? []).filter((doctor) => doctor.isActive);
  const isUsingFallbackCatalog = cmsDoctors.length === 0;

  const displayDoctors = useMemo<FallbackDoctor[]>(() => {
    const sourceItems = isUsingFallbackCatalog
      ? doctorsCatalog.map((doctor, index) => ({
          id: -(index + 1),
          nameAz: doctor.nameAz,
          specialtyAz: doctor.specialtyAz,
          bioAz: doctor.bioAz ?? null,
          photoUrl: doctor.photoUrl ?? null,
          whatsappUrl: doctor.whatsappUrl ?? null,
          telegramUrl: doctor.telegramUrl ?? null,
          instagramUrl: doctor.instagramUrl ?? null,
          experienceYears: doctor.experienceYears ?? null,
          order: doctor.order,
          isActive: doctor.isActive,
        }))
      : cmsDoctors;

    return [...sourceItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [cmsDoctors, isUsingFallbackCatalog]);

  useEffect(() => {
    const updateMetrics = () => {
      const viewportWidth = viewportRef.current?.clientWidth ?? 0;
      const visibleCount = window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 2 : 1;
      const gap = window.innerWidth >= 1024 ? 24 : 16;
      const totalGap = gap * Math.max(visibleCount - 1, 0);
      const cardWidth = visibleCount > 0 ? Math.max((viewportWidth - totalGap) / visibleCount, 0) : 0;

      setMetrics({ visibleCount, gap, cardWidth });
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  useEffect(() => {
    const maxIndex = Math.max(displayDoctors.length - metrics.visibleCount, 0);
    if (slideIndex > maxIndex) {
      setSlideIndex(maxIndex);
    }
  }, [displayDoctors.length, metrics.visibleCount, slideIndex]);

  const doctorMap = buildSettingsMap(doctorSettings);
  const socialMap = buildSettingsMap(socialSettings);
  const contactMap = buildSettingsMap(contactSettings);

  const title = getSetting(doctorMap, 'doctors.title', 'Həkimlərimiz');
  const subtitle = getSetting(
    doctorMap,
    'doctors.subtitle',
    'Klinikamızın peşəkar mütəxəssisləri ilə tanış olun.'
  );

  const fallbackContactLinks: ContactLink[] = useMemo(() => {
    return [
      {
        href: toWhatsappHref(getSetting(contactMap, 'contact.whatsapp', '+994501234567')),
        label: 'WhatsApp',
        icon: MessageCircle,
      },
      {
        href: getSetting(socialMap, 'social.telegram', 'https://t.me/dialab'),
        label: 'Telegram',
        icon: Send,
      },
      {
        href: getSetting(socialMap, 'social.instagram', 'https://instagram.com/dialab'),
        label: 'Instagram',
        icon: Instagram,
      },
    ];
  }, [contactMap, socialMap]);

  const maxIndex = Math.max(displayDoctors.length - metrics.visibleCount, 0);
  const step = metrics.cardWidth + metrics.gap;

  if (!displayDoctors.length) {
    return null;
  }

  return (
    <motion.section
      id="doctors"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden border-t-2 border-[#00b982]/25 bg-gradient-to-br from-white via-[#f4fff9] to-[#eaf5fc] py-24 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-10 h-72 w-72 rounded-full bg-[#00b982]/10 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-4rem] h-80 w-80 rounded-full bg-[#1a365d]/8 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <div className="mb-10 flex flex-col gap-8 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-[#00b982]/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#00b982] shadow-[0_16px_34px_-26px_rgba(0,185,130,0.45)] backdrop-blur-md">
              {title}
            </div>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#4a617b] sm:text-lg">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <button
              type="button"
              aria-label="Əvvəlki həkimlər"
              onClick={() => setSlideIndex((current) => Math.max(current - 1, 0))}
              disabled={slideIndex === 0}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#d6e9e1] bg-white text-[#1a365d] shadow-[0_16px_28px_-22px_rgba(15,31,53,0.22)] transition-all hover:-translate-y-0.5 hover:border-[#00b982]/40 hover:text-[#00b982] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Növbəti həkimlər"
              onClick={() => setSlideIndex((current) => Math.min(current + 1, maxIndex))}
              disabled={slideIndex >= maxIndex}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#d6e9e1] bg-white text-[#1a365d] shadow-[0_16px_28px_-22px_rgba(15,31,53,0.22)] transition-all hover:-translate-y-0.5 hover:border-[#00b982]/40 hover:text-[#00b982] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div ref={viewportRef} className="overflow-hidden">
          <motion.div
            className="flex"
            style={{ gap: `${metrics.gap}px` }}
            animate={{ x: -(slideIndex * step) }}
            transition={{ type: 'spring', stiffness: 220, damping: 30 }}
          >
            {displayDoctors.map((doctor, index) => {
              const backdrop = getDoctorBackdrop(index, doctor.photoUrl);
              const displayName = getDoctorDisplayName(doctor.nameAz);
              const hasCustomPhoto = Boolean(doctor.photoUrl);
              const contactLinks: ContactLink[] = [
                {
                  href: doctor.whatsappUrl || fallbackContactLinks[0]?.href || '#appointment',
                  label: 'WhatsApp',
                  icon: MessageCircle,
                },
                {
                  href: doctor.telegramUrl || fallbackContactLinks[1]?.href || '#appointment',
                  label: 'Telegram',
                  icon: Send,
                },
                {
                  href: doctor.instagramUrl || fallbackContactLinks[2]?.href || '#appointment',
                  label: 'Instagram',
                  icon: Instagram,
                },
              ];

              return (
                <article
                  key={doctor.id}
                  className="group relative flex min-w-0 flex-col overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] shadow-[0_22px_55px_-34px_rgba(15,31,53,0.28)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_68px_-30px_rgba(0,185,130,0.2)]"
                  style={{
                    width: metrics.cardWidth || undefined,
                    flex: metrics.cardWidth ? `0 0 ${metrics.cardWidth}px` : '1 0 0%',
                  }}
                >
                  <div className="px-4 pt-4">
                    <div className="relative h-[360px] overflow-hidden rounded-[24px] border border-[#d9e7df] bg-[linear-gradient(180deg,#f8fcfa_0%,#eef6f2_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:h-[390px]">
                      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.65)_0%,rgba(255,255,255,0)_100%)]" />
                      <img
                        src={backdrop}
                        alt={displayName}
                        className={getDoctorImageClass(hasCustomPhoto)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between px-6 pb-6 pt-5">
                    <div>
                      <h3 className="text-xl font-bold leading-tight text-[#173255]">
                        {displayName}
                      </h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-[#00b982]">
                        {doctor.specialtyAz}
                      </p>
                    </div>
                  </div>

                    <div className="mt-5 border-t border-[#edf3ef] pt-4">
                      <div className="flex items-center justify-start">
                        <div className="group/reveal relative inline-flex items-center justify-start">
                          <div className="pointer-events-none absolute left-14 top-1/2 flex -translate-y-1/2 items-center gap-2">
                            {contactLinks.map((link, linkIndex) => {
                              const Icon = link.icon;
                              return (
                                <a
                                  key={link.label}
                                  href={link.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={link.label}
                                  className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9eae1] bg-white text-[#173255] shadow-[0_12px_22px_-18px_rgba(15,31,53,0.25)] transition-all duration-300 hover:scale-110 hover:border-[#00b982]/35 hover:bg-[#00b982] hover:text-white max-lg:translate-x-0 max-lg:opacity-100 lg:translate-x-3 lg:opacity-0 lg:group-hover/reveal:translate-x-0 lg:group-hover/reveal:opacity-100"
                                  style={{
                                    transitionDelay: `${linkIndex * 55}ms`,
                                  }}
                                >
                                  <Icon className="h-4 w-4" />
                                </a>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              document.querySelector('#appointment')?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                              })
                            }
                            className="ml-1 mb-1 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#00b982] text-white shadow-[0_18px_30px_-18px_rgba(0,185,130,0.62)] transition-transform duration-300 hover:scale-105"
                            aria-label="Qəbul üçün müraciət"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                </article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
