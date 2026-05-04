import { useMemo } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
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

function toWhatsappHref(rawValue: string) {
  const normalized = rawValue.replace(/[^\d+]/g, '');
  const phone = normalized.startsWith('+') ? normalized.slice(1) : normalized;
  return phone ? `https://wa.me/${phone}` : '#appointment';
}

export default function DoctorsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    dragFree: false,
    containScroll: false,
    skipSnaps: false,
    slidesToScroll: 1,
  });

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

  const doctorMap = buildSettingsMap(doctorSettings);
  const socialMap = buildSettingsMap(socialSettings);
  const contactMap = buildSettingsMap(contactSettings);

  const title = getSetting(doctorMap, 'doctors.title', 'Həkimlərimiz');
  const subtitle = getSetting(doctorMap, 'doctors.shortSubtitle', 'Peşəkar komanda');

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
      className="relative overflow-hidden border-t-2 border-[#00b982]/25 bg-gradient-to-br from-[#eef5f7] via-[#e6f1ef] to-[#dce8f2] py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-10 h-72 w-72 rounded-full bg-[#00b982]/10 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-4rem] h-80 w-80 rounded-full bg-[#1a365d]/8 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <div className="relative mb-10 lg:mb-12">
          <div className="mx-auto max-w-[40rem] text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6b8097]">
              Bizim heyət
            </p>
            <h2 className="mt-4 text-balance text-[2.45rem] font-extrabold leading-[0.96] tracking-[-0.05em] text-[#173255] sm:text-[3rem] lg:text-[4.2rem]">
              {title}
            </h2>
            <p className="mt-4 text-[15px] font-medium leading-6 tracking-[0.01em] text-[#6b8097] sm:text-base">
              {subtitle}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 lg:absolute lg:right-0 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2">
            <button
              type="button"
              aria-label="Əvvəlki həkimlər"
              onClick={() => emblaApi?.scrollPrev()}
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#d6e9e1] bg-white text-[#1a365d] shadow-[0_18px_30px_-24px_rgba(15,31,53,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00b982]/40 hover:text-[#00b982]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Növbəti həkimlər"
              onClick={() => emblaApi?.scrollNext()}
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#d6e9e1] bg-white text-[#1a365d] shadow-[0_18px_30px_-24px_rgba(15,31,53,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00b982]/40 hover:text-[#00b982]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div ref={emblaRef} className="overflow-hidden">
          <div className="-ml-4 flex touch-pan-y">
            {displayDoctors.map((doctor, index) => {
              const backdrop = getDoctorBackdrop(index, doctor.photoUrl);
              const displayName = getDoctorDisplayName(doctor.nameAz);
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
                  className="group min-w-0 shrink-0 basis-full pl-4 sm:basis-1/2 xl:basis-1/4"
                >
                  <div className="flex h-full min-h-[36rem] flex-col overflow-hidden rounded-[30px] border border-[#cfddd8] bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] shadow-[0_24px_56px_-34px_rgba(15,31,53,0.28)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_32px_72px_-30px_rgba(0,185,130,0.18)]">
                    <div className="px-4 pt-4">
                      <div className="relative h-[390px] overflow-hidden rounded-[24px] border border-[#d9e7df] bg-[linear-gradient(180deg,#f8fcfa_0%,#eef6f2_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:h-[420px]">
                        <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-white">
                        <img
                          src={backdrop}
                          alt={displayName}
                          className="absolute inset-0 h-full w-full object-contain object-center transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                        />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                      <div className="min-h-[5.75rem]">
                        <h3 className="text-[2rem] font-extrabold leading-tight tracking-[-0.03em] text-[#173255] sm:text-[2.1rem]">
                          {displayName}
                        </h3>
                        <p className="mt-2 text-[15px] font-medium leading-6 text-[#00b982]">
                          {doctor.specialtyAz}
                        </p>
                      </div>

                      <div className="mt-auto border-t border-[#edf3ef] pt-4">
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
                                    className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9eae1] bg-white text-[#173255] shadow-[0_12px_22px_-18px_rgba(15,31,53,0.25)] transition-all duration-300 hover:scale-105 hover:border-[#00b982]/35 hover:bg-[#00b982] hover:text-white max-lg:translate-x-0 max-lg:opacity-100 lg:translate-x-3 lg:opacity-0 lg:group-hover/reveal:translate-x-0 lg:group-hover/reveal:opacity-100"
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
                              className="ml-1 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#00b982] text-white shadow-[0_18px_30px_-18px_rgba(0,185,130,0.62)] transition-transform duration-300 hover:scale-105"
                              aria-label="Qəbul üçün müraciət"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
