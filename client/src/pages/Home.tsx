/**
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
import MediaGallery from '@/components/MediaGallery';
import LaboratorySection from '@/components/LaboratorySection';
import DiagnosticsSection from '@/components/DiagnosticsSection';
import AppointmentSection from '@/components/AppointmentSection';
import Footer from '@/components/Footer';
import VirtualAssistant from '@/components/VirtualAssistant';

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Sticky Header with Navigation */}
      <Header />
      
      {/* Main Content */}
      <main>
        {/* Section 1: Hero - Full width parallax with About Us */}
        <HeroSection />
        
        {/* Section 2: Media Gallery - About Us with image slider */}
        <MediaGallery />
        
        {/* Section 3: Laboratory - Accordion with 3D tiles */}
        <LaboratorySection />
        
        {/* Section 4: Diagnostics - Vertical tabs with 3D cards */}
        <DiagnosticsSection />
        
        {/* Section 5: Appointment - Booking form with FAQ */}
        <AppointmentSection />
      </main>
      
      {/* Section 6: Footer - Contact and Map */}
      <Footer />
      
      {/* Floating Virtual Assistant */}
      <VirtualAssistant />
    </div>
  );
}
