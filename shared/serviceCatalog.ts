export type LaboratoryCatalogItem = {
  titleAz: string;
  descriptionAz: string;
  icon: string;
  order: number;
  subTests: Array<[string, string]>;
};

export type DiagnosticCatalogItem = {
  titleAz: string;
  descriptionAz: string;
  icon: string;
  order: number;
  subServices: string[];
};

export const laboratoryCatalog: LaboratoryCatalogItem[] = [
  {
    titleAz: "Klinik",
    descriptionAz:
      "Gündəlik diaqnostika üçün əsas klinik analizlər paketi.",
    icon: "blood",
    order: 0,
    subTests: [
      ["Qanın ümumi analizi", "Əsas qan göstəricilərinin qiymətləndirilməsi"],
      ["Sidik analizi", "Sidik yolları və böyrək vəziyyəti"],
      ["Biokimyəvi analiz", "Orqanların ümumi funksional qiymətləndirilməsi"],
      ["Qlükoza testi", "Qanda şəkər səviyyəsinin yoxlanması"],
      ["Qaraciyər testləri", "ALT, AST və əlaqəli markerlər"],
      ["Böyrək funksiyası", "Kreatinin və sidik cövhəri"],
      ["Hormon analizi", "Endokrin balans göstəriciləri"],
      ["Vitamin və mikroelementlər", "Vitamin və mineral ehtiyatları"],
    ],
  },
  {
    titleAz: "Biokimya",
    descriptionAz:
      "Maddələr mübadiləsi və daxili orqan funksiyalarını dəyərləndirən analizlər.",
    icon: "biochemical",
    order: 1,
    subTests: [
      ["Qlükoza", "Qanda şəkər səviyyəsi"],
      ["ALT və AST", "Qaraciyər fermentləri"],
      ["Bilirubin", "Qaraciyər və öd göstəricisi"],
      ["Xolesterin", "Lipid mübadiləsinin əsas göstəricisi"],
      ["Triqliseridlər", "Ürək-damar riskinin qiymətləndirilməsi"],
      ["Kreatinin", "Böyrək funksiyası"],
      ["Sidik cövhəri", "Azot mübadiləsi göstəricisi"],
      ["Elektrolitlər", "Na, K, Ca, Mg balansı"],
    ],
  },
  {
    titleAz: "Hormonal",
    descriptionAz:
      "Hormonal balansı və endokrin sistemin vəziyyətini göstərən analizlər.",
    icon: "vitamin",
    order: 2,
    subTests: [
      ["TSH", "Qalxanabənzər vəzin əsas göstəricisi"],
      ["T3 və T4", "Tiroid hormon balansı"],
      ["Prolaktin", "Hipofiz və reproduktiv hormon"],
      ["Estradiol", "Qadın hormonal fonu"],
      ["Progesteron", "Reproduktiv dövr göstəricisi"],
      ["Testosteron", "Kişi hormonal profili"],
      ["Kortizol", "Stress hormonu"],
      ["İnsulin və C-peptid", "Şəkər mübadiləsi"],
    ],
  },
  {
    titleAz: "İnfeksiya PCR",
    descriptionAz:
      "Virus və bakterial infeksiyaların dəqiq aşkarlanması üçün PCR və seroloji testlər.",
    icon: "immune",
    order: 3,
    subTests: [
      ["Hepatit B", "Virus infeksiyası skrininqi"],
      ["Hepatit C", "Virus infeksiyası skrininqi"],
      ["HIV", "İlkin infeksiya testi"],
      ["Sifilis", "Seroloji infeksiya testi"],
      ["Herpes və CMV", "Virus mənşəli infeksiyalar"],
      ["Toxoplazma", "TORCH panel göstəricisi"],
      ["Xlamidiya və mikoplazma", "Urogenital infeksiyalar"],
      ["HPV", "Papilloma virusu üçün PCR"],
    ],
  },
  {
    titleAz: "Bakteriologiya",
    descriptionAz:
      "Bakterial infeksiyaların növünü və həssaslığını müəyyən edən müayinələr.",
    icon: "microscope",
    order: 4,
    subTests: [
      ["Sidiyin əkilməsi", "Sidikdə bakterial artımın təyini"],
      ["Qanın sterilliyi", "Qanda mikroorqanizmlərin yoxlanması"],
      ["Boğaz yaxması", "Yerli infeksiyaların analizi"],
      ["Burun yaxması", "Nazal flora qiymətləndirilməsi"],
      ["Urogenital material", "Urogenital sahə üzrə müayinə"],
      ["Nəcisin bakterioloji testi", "Bağırsaq florasının qiymətləndirilməsi"],
      ["Sperma əkilməsi", "Bakterial infeksiyaların aşkarlanması"],
      ["Antibiotikogramma", "Antibiotik həssaslığının təyini"],
    ],
  },
  {
    titleAz: "İmmunoloji",
    descriptionAz:
      "İmmun sistem, laxtalanma və onkoloji risk üçün geniş laborator panel.",
    icon: "dna",
    order: 5,
    subTests: [
      ["İmmunoqlobulinlər", "IgA, IgM, IgG, IgE paneli"],
      ["Allergo testlər", "Qida və tənəffüs allergenləri"],
      ["ANA", "Autoimmun aktivlik göstəricisi"],
      ["Autoimmun markerlər", "Əlavə immunoloji panel"],
      ["Koaquloqramma", "Laxtalanma sistemi göstəriciləri"],
      ["D-dimer", "Tromboz riskinin qiymətləndirilməsi"],
      ["Onkomarkerlər", "Şiş markerləri paneli"],
      ["Komplement sistemi", "İmmun cavabın əlavə göstəriciləri"],
    ],
  },
  {
    titleAz: "Genetik",
    descriptionAz:
      "Sitoloji, histoloji və genetik səviyyədə aparılan dəqiq diaqnostik müayinələr.",
    icon: "genetics",
    order: 6,
    subTests: [
      ["Pap-smear", "Uşaqlıq boynu sitologiyası"],
      ["Biopsiya analizi", "Toxuma nümunələrinin qiymətləndirilməsi"],
      ["Sitoloji mayelər", "Maye nümunələrinin analizi"],
      ["Sitoloji yaxmalar", "Yaxma materialının qiymətləndirilməsi"],
      ["Histoloji müayinə", "Toxuma səviyyəsində diaqnostika"],
      ["Şiş hüceyrələri", "Onkoloji hüceyrə aşkarlanması"],
      ["Genetik mutasiyalar", "Genetik dəyişikliklərin təyini"],
      ["Prenatal və irsi skrininq", "İrsi risk və prenatal diaqnostika"],
    ],
  },
  {
    titleAz: "Vitaminlər",
    descriptionAz:
      "Vitamin, mineral və mikroelement balansını qiymətləndirən laborator analizlər.",
    icon: "pill",
    order: 7,
    subTests: [
      ["Vitamin D", "Sümük və immun balansı üçün əsas vitamin"],
      ["Vitamin B12", "Sinir sistemi və qan yaranması göstəricisi"],
      ["Fol turşusu", "Hematoloji və metabolik balans"],
      ["Ferritin", "Dəmir ehtiyatları göstəricisi"],
      ["Dəmir", "Mikroelement statusu"],
      ["Kalsium", "Sümük və mineral balansı"],
      ["Maqnezium", "Sinir və əzələ fəaliyyəti"],
      ["Sink", "İmmun və ferment sistemləri üçün vacib element"],
    ],
  },
];

export const diagnosticsCatalog: DiagnosticCatalogItem[] = [
  {
    titleAz: "USM",
    descriptionAz:
      "USM, doppler və funksional müayinələr üzrə instrumental diaqnostika.",
    icon: "activity",
    order: 0,
    subServices: [
      "Ginekoloji USM",
      "Hamiləlik zamanı USM",
      "Daxili orqanların USM",
      "Prostat və sidik yolları USM",
      "Xaya kisəsi və xayalar USM",
      "Damar dopplerqrafiyası",
      "EKQ və ExoKQ",
      "EEQ və monitorinq",
    ],
  },
  {
    titleAz: "Həkim qəbulları",
    descriptionAz:
      "Müxtəlif ixtisaslar üzrə ilkin müayinə və həkim məsləhətləri.",
    icon: "stethoscope",
    order: 1,
    subServices: [
      "Kardioloq",
      "Ginekoloq",
      "Terapevt",
      "Nevropatoloq",
      "Endokrinoloq",
      "Uroloq",
      "Oftalmoloq",
      "Dermatoveneroloq və reabilitoloq",
    ],
  },
  {
    titleAz: "Ginekologiya",
    descriptionAz:
      "Qadın sağlamlığı üzrə müayinə, diaqnostika və əsas prosedurlar.",
    icon: "gyneco",
    order: 2,
    subServices: [
      "Ginekoloqun məsləhəti və müayinəsi",
      "Kolposkopiya",
      "Biopsiya və kiüretaj",
      "Uşaqlıq boynunun müalicəsi",
      "Spiralın qoyulması",
      "Spiralın çıxarılması",
      "Yerli müalicəvi prosedurlar",
      "Sonsuzluq və reproduktiv prosedurlar",
    ],
  },
  {
    titleAz: "Urologiya və dermatologiya",
    descriptionAz:
      "Urologiya, dermatologiya və intim sağlamlıq üzrə konsultasiya və prosedurlar.",
    icon: "doctor",
    order: 3,
    subServices: [
      "Uroloqla məsləhət",
      "Dermatoveneroloqun məsləhəti",
      "Uretrit və prostatit",
      "Herpes və sitomeqalovirus",
      "Xlamidiya və ureaplazma",
      "Kişi sonsuzluğu",
      "Papilloma və xal götürülməsi",
      "İntim sağlamlıq prosedurları",
    ],
  },
  {
    titleAz: "Terapiya",
    descriptionAz:
      "Daxili xəstəliklər üzrə terapevtik konsultasiya və müalicə istiqamətləri.",
    icon: "heart",
    order: 4,
    subServices: [
      "Terapevtin məsləhəti",
      "Ürək-damar xəstəlikləri",
      "Həzm sistemi xəstəlikləri",
      "Tənəffüs sistemi xəstəlikləri",
      "Allergik xəstəliklər",
      "Viral xəstəliklər",
      "Hidrokolonoterapiya",
      "Plazmaferez və sistemli müalicə",
    ],
  },
  {
    titleAz: "Nevrologiya",
    descriptionAz:
      "Nevroloji diaqnostika, ağrı sindromları və bərpaedici müalicə.",
    icon: "neuro",
    order: 5,
    subServices: [
      "Nevropatoloqun məsləhəti",
      "EEQ",
      "Gecəlik EEQ monitorinqi",
      "Nevrozlar və OKP",
      "Baş ağrıları və miqren",
      "Qan dövranı pozğunluqları",
      "Ensefalopatiya və insult sonrası",
      "Nevroreabilitasiya",
    ],
  },
  {
    titleAz: "Reabilitasiya",
    descriptionAz:
      "Manipulyasiya, fizioterapiya və bərpaedici xidmətlər.",
    icon: "zap",
    order: 6,
    subServices: [
      "İnyeksiyalar",
      "İnfuziyalar",
      "Təzyiq ölçülməsi",
      "Evdə tibb bacısı xidməti",
      "Reabilitasiya və müalicəvi bədən tərbiyəsi",
      "Elektro və maqnitoterapiya",
      "Lazeroterapiya və darsonval",
      "Tibbi və bioenergetik masaj",
    ],
  },
];
