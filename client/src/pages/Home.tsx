/*
 * Home Page - DIALAB Klinika
 * Design Philosophy: "Presizion Tibb" - Swiss Design + Subtle 3D Depth
 * 
 * Sections:
 * 1. Hero - Full-width parallax with About Us and Service Search
 * 2. Media Gallery - About Us with image slider
 * 3. Laboratory - Accordion with 3D animated tiles
 * 4. Diagnostics - Vertical tabs with expanding flashcards
 * 5. Appointment - Booking form with FAQ
 * 6. Contact/Footer - Map and contact info
 */

import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import InfoBar from '@/components/InfoBar';
import MediaGallery from '@/components/MediaGallery';
import LaboratorySection from '@/components/LaboratorySection';
import DiagnosticsSection from '@/components/DiagnosticsSection';
import AppointmentSection from '@/components/AppointmentSection';
import Footer from '@/components/Footer';
import VirtualAssistant from '@/components/VirtualAssistant';
import { trpc } from '@/lib/trpc';
import { buildSettingsMap, parseHomeSections, type HomeSectionSetting } from '@/lib/siteSettings';

const fallbackSections: HomeSectionSetting[] = [
  { id: 'hero', enabled: true },
  { id: 'infoBar', enabled: true },
  { id: 'gallery', enabled: true },
  { id: 'laboratory', enabled: true },
  { id: 'diagnostics', enabled: true },
  { id: 'appointment', enabled: true },
];

export default function Home() {
  const { data: homeSettings } = trpc.cms.settings.getGroup.useQuery({ group: 'home' });
  const settingsMap = buildSettingsMap(homeSettings);
  const sections = parseHomeSections(settingsMap['home.sections'], fallbackSections);

  const sectionRegistry = {
    hero: HeroSection,
    infoBar: InfoBar,
    gallery: MediaGallery,
    laboratory: LaboratorySection,
    diagnostics: DiagnosticsSection,
    appointment: AppointmentSection,
  } as const;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />

      <main>
        {sections
          .filter((section) => section.enabled)
          .map((section) => {
            const Component = sectionRegistry[section.id as keyof typeof sectionRegistry];
            return Component ? <Component key={section.id} /> : null;
          })}
      </main>

      <Footer />
      <VirtualAssistant />
    </div>
  );
}
