import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VirtualAssistant from '@/components/VirtualAssistant';
import { trpc } from '@/lib/trpc';
import { useParams } from 'wouter';

export default function ContentPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { data: page, isLoading } = trpc.cms.pages.getBySlug.useQuery({ slug }, { enabled: Boolean(slug) });

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <main className="pt-24">
        {isLoading ? (
          <div className="container mx-auto px-4 lg:px-8 py-24">
            <div className="h-8 w-56 bg-gray-100 rounded animate-pulse mb-4" />
            <div className="h-4 w-full max-w-2xl bg-gray-100 rounded animate-pulse" />
          </div>
        ) : page ? (
          <>
            <section className="relative py-20 lg:py-28 bg-gradient-to-br from-white via-[#f0fdf4] to-[#e8f4fc] border-b border-[#00b982]/10">
              <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <p className="uppercase tracking-[0.2em] text-sm font-semibold text-[#00b982] mb-3">Səhifə</p>
                  <h1 className="text-4xl md:text-5xl font-bold text-[#1a365d]">{page.titleAz}</h1>
                  {page.excerptAz && (
                    <p className="mt-5 text-lg text-gray-600 leading-relaxed">{page.excerptAz}</p>
                  )}
                </div>
                {page.heroImageUrl ? (
                  <div className="rounded-3xl overflow-hidden border border-[#00b982]/15 shadow-xl shadow-black/10 min-h-[280px]">
                    <img src={page.heroImageUrl} alt={page.titleAz} className="w-full h-full object-cover" />
                  </div>
                ) : null}
              </div>
            </section>

            <section className="py-16 lg:py-20">
              <div className="container mx-auto px-4 lg:px-8">
                <div className="max-w-4xl prose prose-lg prose-headings:text-[#1a365d] prose-p:text-gray-700 whitespace-pre-wrap">
                  {page.contentAz || 'Bu səhifə üçün hələ məzmun əlavə edilməyib.'}
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="container mx-auto px-4 lg:px-8 py-24">
            <h1 className="text-3xl font-bold text-[#1a365d]">Səhifə tapılmadı</h1>
            <p className="mt-3 text-gray-600">Bu keçid üçün dərc olunmuş səhifə yoxdur.</p>
          </div>
        )}
      </main>
      <Footer />
      <VirtualAssistant />
    </div>
  );
}
