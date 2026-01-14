/**
 * Home Page - DIALAB Klinika
 * Design Philosophy: "Presizion Tibb" - Swiss Design + Subtle 3D Depth
 * 
 * Features:
 * - Sticky header with hover glow effects
 * - Full-width parallax hero slider
 * - Accordion laboratory section with 3D tiles
 * - Vertical tabs diagnostics with 3D info cards
 * - Booking form with virtual assistant
 * - Footer with FAQ and interactive map
 */

import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import LaboratorySection from '@/components/LaboratorySection';
import DiagnosticsSection from '@/components/DiagnosticsSection';
import AppointmentSection from '@/components/AppointmentSection';
import Footer from '@/components/Footer';
import VirtualAssistant from '@/components/VirtualAssistant';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header with Navigation */}
      <Header />
      
      {/* Main Content */}
      <main>
        {/* Hero Section - Full width parallax slider */}
        <HeroSection />
        
        {/* Laboratory Section - Accordion with 3D tiles */}
        <LaboratorySection />
        
        {/* Diagnostics Section - Vertical tabs with 3D cards */}
        <DiagnosticsSection />
        
        {/* Appointment Section - Booking form */}
        <AppointmentSection />
      </main>
      
      {/* Footer - FAQ and Map */}
      <Footer />
      
      {/* Floating Virtual Assistant */}
      <VirtualAssistant />
    </div>
  );
}
