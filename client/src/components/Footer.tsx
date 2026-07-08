import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Instagram, Send, MessageCircle, ExternalLink } from 'lucide-react';
import { MapView } from '@/components/Map';
import { trpc } from '@/lib/trpc';
import { buildSettingsMap, getSetting, parseCoordinate } from '@/lib/siteSettings';

export default function Footer() {
  const { data: contactSettings } = trpc.cms.settings.getGroup.useQuery({ group: 'contact' });
  const { data: hoursSettings } = trpc.cms.settings.getGroup.useQuery({ group: 'hours' });
  const { data: socialSettings } = trpc.cms.settings.getGroup.useQuery({ group: 'social' });

  const contactMap = buildSettingsMap(contactSettings);
  const hoursMap = buildSettingsMap(hoursSettings);
  const socialMap = buildSettingsMap(socialSettings);

  const address = getSetting(contactMap, 'contact.address', 'Tbilisi prospekti, 3007 məhəllə, bina 44c');
  const phone1 = getSetting(contactMap, 'contact.phone1', '+994 12 345 67 89');
  const email = getSetting(contactMap, 'contact.email', 'info@dialab.center');
  const whatsapp = getSetting(contactMap, 'contact.whatsapp', '+994501234567');
  const telegramUrl = socialMap['social.telegram'] || socialMap['social.facebook'] || 'https://t.me/';
  const locationTitle = getSetting(contactMap, 'contact.locationTitle', 'Bizim ünvanımız');
  const mapUrl = getSetting(
    contactMap,
    'contact.mapUrl',
    'https://www.google.com/maps/place/Dialab+Klinika/@40.4025664,49.8081976,431m/data=!3m2!1e3!4b1!4m6!3m5!1s0x4030870013e1a3f5:0xd18b86541ce1e4c2!8m2!3d40.4025664!4d49.8094851!16s%2Fg%2F11z3lkv4f_!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D'
  );
  const location = {
    lat: parseCoordinate(contactMap['contact.latitude'], 40.40234),
    lng: parseCoordinate(contactMap['contact.longitude'], 49.80917),
  };

  const handleMapReady = (map: google.maps.Map) => {
    new google.maps.Marker({
      position: location,
      map,
      title: locationTitle,
      icon: {
        url: '/images/dia_logo_symbol.png',
        scaledSize: new google.maps.Size(40, 40),
      },
    });
    map.setCenter(location);
    map.setZoom(15);
  };

  return (
    <motion.footer
      id="contact"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="relative bg-gradient-to-br from-[#edf4f7] via-[#e4efee] to-[#d9e6f0] overflow-hidden border-t-2 border-[#00b982]/30"
    >
      <motion.div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#00b982]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#14b8a6]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00b982]/5 to-[#1a365d]/5 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 py-16">
        <div className="mb-16 lg:mb-20 flex justify-center">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a365d] mb-3">Əlaqə</h2>
            <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">Bizimə əlaqə saxlayın</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative h-80 lg:h-auto rounded-2xl overflow-hidden border border-[#00b982]/20">
            <MapView onMapReady={handleMapReady} initialCenter={location} title={locationTitle} className="w-full h-full min-h-[320px]" />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00b982] to-[#14b8a6] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1a365d]">{locationTitle}</h4>
                  <p className="text-gray-600 text-sm">{address}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#00b982] hover:text-[#00a572] transition-colors text-sm font-medium"
                    >
                      Xəritədə aç
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
            <div>
              <h3 className="font-bold text-2xl text-[#1a365d] mb-6">Əlaqə Məlumatları</h3>
              <div className="space-y-4">
                <a href={`tel:${phone1.replace(/\s+/g, '')}`} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#00b982]/20 hover:border-[#00b982]/50 hover:shadow-lg hover:shadow-[#00b982]/10 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00b982] to-[#14b8a6] flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Telefon</p>
                    <p className="text-[#1a365d] font-semibold group-hover:text-[#00b982] transition-colors">{phone1}</p>
                  </div>
                </a>

                <a href={`mailto:${email}`} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#00b982]/20 hover:border-[#00b982]/50 hover:shadow-lg hover:shadow-[#00b982]/10 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#a855f7] flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">E-poçt</p>
                    <p className="text-[#1a365d] font-semibold group-hover:text-[#00b982] transition-colors">{email}</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-[#fef3c7] to-[#fef08a] rounded-xl border border-[#f59e0b]/30">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#f97316] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm font-semibold mb-2">Iş Saatları</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700"><span className="font-semibold">Bazar ertəsi - Cümə:</span> {getSetting(hoursMap, 'hours.weekdays', '09:00 - 18:00')}</p>
                      <p className="text-gray-700"><span className="font-semibold">Şənbə:</span> {getSetting(hoursMap, 'hours.saturday', '09:00 - 14:00')}</p>
                      <p className="text-gray-500"><span className="font-semibold">Bazar:</span> {getSetting(hoursMap, 'hours.sunday', 'Bağlı')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-[#1a365d] mb-4">Sosial Şəbəkələr</h4>
              <div className="flex gap-3">
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center hover:bg-sky-600 transition-colors">
                  <Send className="w-6 h-6 text-white" />
                </a>
                <a href={getSetting(socialMap, 'social.instagram', 'https://instagram.com/dialabklinika')} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center hover:opacity-90 transition-opacity">
                  <Instagram className="w-6 h-6 text-white" />
                </a>
                <a href={`https://wa.me/${whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors">
                  <MessageCircle className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src="/images/dia_logo_text.png" alt="DIALAB Klinika" className="h-14 w-auto max-w-[170px] object-contain" />

            <p className="text-gray-500 text-sm text-center">© {new Date().getFullYear()} DIALAB Klinika. Bütün hüquqlar qorunur.</p>

            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-[#00b982] transition-colors">Məxfilik Siyasəti</a>
              <a href="#" className="text-gray-400 hover:text-[#00b982] transition-colors">İstifadə Şərtləri</a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
